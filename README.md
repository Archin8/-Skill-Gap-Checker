AI-Powered Resume Analyzer & Job Matcher
This is a full-stack web application built with the MERN stack that leverages the power of Google's Gemini AI to provide users with an in-depth analysis of their resume and matches them with relevant job opportunities.

Users can upload their resume (PDF or DOCX), and the application will:

Identify their primary professional domain.

Extract a list of their key skills.

Provide actionable suggestions for resume improvement.

Perform a detailed Skill Gap Analysis by comparing their skills against the requirements for relevant job vacancies.

This project was built from scratch as a comprehensive learning exercise, covering everything from frontend design and backend API development to AI integration and data parsing.

Features
Professional Frontend: A sleek, modern, and fully responsive user interface built with React.

Drag-and-Drop File Upload: Easy and intuitive resume uploading.

Multi-Step User Experience: A guided flow for uploading, analyzing, and viewing results.

Advanced AI Analysis: Utilizes the Google Gemini API for:

Domain Identification: Automatically determines the user's professional field.

Skill Extraction: Pulls a list of relevant skills directly from the resume text.

Improvement Suggestions: Provides concrete feedback to enhance the user's resume.

Skill Gap Analysis: Compares the user's skills against job requirements to show "Matching" and "Missing" skills for each vacancy.

Robust Backend: A secure and efficient backend built with Node.js and Express.

Tech Stack
Frontend: React, Vite, Axios, React Dropzone

Backend: Node.js, Express.js

Database: MongoDB (with Mongoose)

AI Model: Google Gemini API (gemini-1.5-flash-latest)

File Parsing: pdf-parse (for PDFs), mammoth (for DOCX)

Authentication (Optional): jsonwebtoken, bcryptjs

Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Node.js installed on your machine

A MongoDB database (local or via Atlas)

A Google Gemini API Key