import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

// Icon components
const UploadIcon = () => ( <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16.5V3M12 3L16.5 7.5M12 3L7.5 7.5" stroke="#4a5568" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 12.5C20 17.1667 16.5 21 12 21C7.5 21 4 17.1667 4 12.5" stroke="#4a5568" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const FileIcon = () => ( <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="#cbd5e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2V8H20" stroke="#cbd5e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 13H8" stroke="#cbd5e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 17H8" stroke="#cbd5e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 9H8" stroke="#cbd5e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const BuildingIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> );

function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [analysisResult, setAnalysisResult] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], },
    multiple: false
  });

  const handleUpload = () => {
    if (!file) { setError('Please select a file first.'); return; }
    setStep(2);
    setError('');
    const formData = new FormData();
    formData.append('resume', file);

    axios.post('http://localhost:5000/api/upload', formData)
      .then(res => { setTimeout(() => { setAnalysisResult(res.data); setStep(3); }, 2000); })
      .catch(err => { console.error(err); setError('Upload failed. The server might be down or the file is corrupted.'); setStep(1); });
  };

  const handleReset = () => { setFile(null); setError(''); setAnalysisResult(null); setStep(1); };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
              <input {...getInputProps()} />
              {file ? <FileIcon /> : <UploadIcon />}
              <p>{file ? file.name : 'Drag & drop your resume here, or click to select'}</p>
              <span className="dropzone-hint">Supports: PDF, DOC, DOCX</span>
            </div>
            <button onClick={handleUpload} disabled={!file} className="cta-button">Analyze Resume</button>
            {error && <p className="message error">{error}</p>}
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <div className="loader"></div>
            <p className="analyzing-text">Analyzing your resume...</p>
            <p className="analyzing-subtext">This will only take a moment.</p>
          </div>
        );
      case 3:
        return (
          <div className="step-content results">
            <h2>Analysis Complete!</h2>
            <div className="results-grid">
              <div className="results-section domain-section">
                <h3>Identified Domain</h3>
                <p className="results-domain"><strong>{analysisResult.analysis.domain}</strong></p>
              </div>
              <div className="results-section skills-section">
                <h3>Your Top Skills</h3>
                <div className="skills-list">
                  {Array.isArray(analysisResult?.analysis?.skills) && analysisResult.analysis.skills.map((skill, index) => ( <span key={index} className="skill-tag">{skill}</span> ))}
                </div>
              </div>
              <div className="results-section suggestions-section">
                <h3>Improvement Suggestions</h3>
                <ul className="suggestions-list">
                  {Array.isArray(analysisResult?.analysis?.suggestions) && analysisResult.analysis.suggestions.map((suggestion, index) => ( <li key={index}>{suggestion}</li> ))}
                </ul>
              </div>
            </div>
            <h3>Matching Job Vacancies</h3>
            <div className="job-listings">
              {Array.isArray(analysisResult?.jobs) && analysisResult.jobs.length > 0 ? (
                analysisResult.jobs.map(job => (
                  <div key={job.id} className="job-card">
                    <div className="job-card-header">
                      <div className="job-card-icon"><BuildingIcon /></div>
                      <div className="job-card-details">
                        <h3>{job.title}</h3>
                        <p className="job-company">{job.company} &bull; <span>{job.location}</span></p>
                      </div>
                      <a href="#" className="apply-button" onClick={(e) => e.preventDefault()}>Apply</a>
                    </div>
                    <p className="job-description">{job.description}</p>
                    <div className="skill-gap-analysis">
                      {job.matchingSkills.length > 0 && (
                        <div className="skill-match-section">
                          <h4>Matching Skills</h4>
                          <div className="skills-list">
                            {job.matchingSkills.map(skill => <span key={skill} className="skill-tag match">{skill}</span>)}
                          </div>
                        </div>
                      )}
                      {job.missingSkills.length > 0 && (
                        <div className="skill-match-section">
                          <h4>Missing Skills</h4>
                          <div className="skills-list">
                            {job.missingSkills.map(skill => <span key={skill} className="skill-tag missing">{skill}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : ( <p>No job vacancies found for this domain.</p> )}
            </div>
            <button onClick={handleReset} className="cta-button">Analyze Another Resume</button>
          </div>
        );
      default: return null;
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h1>AI Resume Analyzer</h1>
          <p className="subtitle">Unlock your career potential. Let AI guide you.</p>
        </div>
        <div className="card-body">
          {renderStep()}
        </div>
      </div>
       <footer className="main-footer">
        <p>Built with the MERN Stack & AI</p>
      </footer>
    </div>
  );
}

export default App;
