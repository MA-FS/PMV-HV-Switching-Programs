import React, { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import Header from './components/Header';
import InfoForm from './components/InfoForm';
import ProgramTable from './components/ProgramTable';
import Footer from './components/Footer';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SaveConfirmation from './components/SaveConfirmation';
import ReadmeSplash from './components/ReadmeSplash';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const App = () => {
  const [formData, setFormData] = useState({
    work: '', site: '', permitNo: '', programNo: '', referenceDrawing: '', date: '', preparedBy: '', time: '', switcher: '', checkedBy: '', witness: ''
  });
  const [tableData, setTableData] = useState([]);
  const [programs, setPrograms] = useState({});
  const [currentProgramName, setCurrentProgramName] = useState('');
  const [currentProgram, setCurrentProgram] = useState('');
  const [saveConfirmation, setSaveConfirmation] = useState(false);
  const [showReadme, setShowReadme] = useState(false);

  useEffect(() => {
    localforage.getItem('hasVisited').then(hasVisited => {
      if (!hasVisited) {
        setShowReadme(true);
        localforage.setItem('hasVisited', true);
      }
    });

    localforage.getItem('programs').then(savedPrograms => {
      if (savedPrograms) setPrograms(savedPrograms);
    });
  }, []);

  useEffect(() => {
    if (Object.keys(programs).length > 0) {
      localforage.setItem('programs', programs);
    }
  }, [programs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTableDataChange = useCallback((newTableData) => {
    setTableData(newTableData);
  }, []);

  const handleSaveProgram = () => {
    if (currentProgramName.trim() === '') {
      alert('Please enter a name for the program.');
      return;
    }
    if (programs[currentProgramName] && currentProgramName !== currentProgram) {
      if (!window.confirm('Are you sure you want to overwrite this program?')) {
        return;
      }
    }
    setPrograms({ ...programs, [currentProgramName]: { formData, tableData } });
    setCurrentProgram(currentProgramName);
    setCurrentProgramName('');
  };

  const handleUpdateCurrentProgram = () => {
    if (currentProgram.trim() === '') {
      alert('No program is currently loaded.');
      return;
    }
    
    const serializedTableData = JSON.parse(JSON.stringify(tableData));
    
    setPrograms(prevPrograms => ({
      ...prevPrograms,
      [currentProgram]: { formData, tableData: serializedTableData }
    }));

    setSaveConfirmation(true);

    setTimeout(() => {
      setSaveConfirmation(false);
    }, 3000);
  };

  const handleLoadProgram = (programName) => {
    if (!window.confirm('Are you sure you want to open this program?')) {
      return;
    }
    const program = programs[programName];
    setFormData(program.formData);
    setTableData(program.tableData);
    setCurrentProgram(programName);
  };

  const handleDeleteProgram = (programName) => {
    if (!window.confirm('Are you sure you want to delete this program?')) {
      return;
    }
    const newPrograms = { ...programs };
    delete newPrograms[programName];
    setPrograms(newPrograms);
    if (programName === currentProgram) {
      setCurrentProgram('');
      setFormData({
        work: '', site: '', permitNo: '', programNo: '', referenceDrawing: '', date: '', preparedBy: '', time: '', switcher: '', checkedBy: '', witness: ''
      });
      setTableData([]);
    }
  };

  const handleNewProgram = () => {
    if (!window.confirm('Are you sure you want to create a new program? All unsaved changes will be lost.')) {
      return;
    }
    setCurrentProgram('');
    setFormData({
      work: '', site: '', permitNo: '', programNo: '', referenceDrawing: '', date: '', preparedBy: '', time: '', switcher: '', checkedBy: '', witness: ''
    });
    setTableData([]);
    setCurrentProgramName('');
  };

  const handleRenameProgram = (oldName) => {
    const newName = prompt('Enter the new name for the program:', oldName);
    if (newName && newName !== oldName) {
      if (programs[newName]) {
        alert('A program with this name already exists.');
        return;
      }
      const newPrograms = { ...programs };
      newPrograms[newName] = newPrograms[oldName];
      delete newPrograms[oldName];
      setPrograms(newPrograms);
      if (currentProgram === oldName) {
        setCurrentProgram(newName);
      }
    }
  };

  const handleToggleReadme = () => {
    setShowReadme(!showReadme);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Header />
      <div className="container-fluid my-4">
        <div className="header-container">
          <div className="left-content">
            <h4 className="mr-3">Current Program: {currentProgram}</h4>
            <button className="btn btn-primary" onClick={handleUpdateCurrentProgram}>
              Save Current Program
            </button>
          </div>
          <div className="right-content">
            <button className="btn btn-info" onClick={handleToggleReadme}>
              <i className="fas fa-question-circle"></i> View Readme
            </button>
          </div>
        </div>
        <div className="container">
          <InfoForm formData={formData} handleChange={handleChange} />
          <hr className="separator" />
          <ProgramTable tableData={tableData} setTableData={handleTableDataChange} formData={formData} />
          <div className="d-flex justify-content-between mt-3">
            <input
              type="text"
              className="form-control mr-2"
              placeholder="Enter program name"
              value={currentProgramName}
              onChange={(e) => setCurrentProgramName(e.target.value)}
            />
            <button className="btn btn-success mr-2" onClick={handleSaveProgram}>
              Save Program
            </button>
            <button className="btn btn-warning" onClick={handleNewProgram}>
              New Program
            </button>
          </div>
          <div className="mt-3">
            <h2 className="text-primary mb-3">Saved Programs</h2>
            {Object.keys(programs).map(programName => (
              <div className="program-card" key={programName}>
                <div
                  className="program-name"
                  onClick={() => handleLoadProgram(programName)}
                >
                  {programName}
                </div>
                <div className="program-actions">
                  <button
                    className="btn btn-secondary rename-button"
                    onClick={() => handleRenameProgram(programName)}
                  >
                    Rename
                  </button>
                  <button
                    className="btn btn-danger delete-button"
                    onClick={() => handleDeleteProgram(programName)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      <SaveConfirmation show={saveConfirmation} />
      <ReadmeSplash show={showReadme} onClose={() => setShowReadme(false)} />
    </DndProvider>
  );
};

export default App;