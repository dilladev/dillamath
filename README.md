# 🧮 DillaMath - A Math Worksheet Generator

A simple and customizable React tool to generate printable math worksheets as PDF files. Ideal for teachers, homeschoolers, tutors, or anyone needing quick and clean practice sheets for addition, subtraction, multiplication, or division.

<p align="center">
  Example at: https://dilladev.github.io/dillamath/ <br/><br/>
  <img src="https://github.com/user-attachments/assets/2d69a0fa-5bce-4d23-9ea0-cab224322ae7" alt="Centered Image" width="500" />
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/797fe713-67b2-4962-a40a-9d830cfac705" alt="Centered Image" width="500" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/52e1be60-9a0c-4c59-a489-8f466b94b5a2" alt="Centered Image" width="500" />
</p>

## ✨ Features

- Choose the number of questions
- Select math operation: addition, subtraction, multiplication, or division
- Customize the maximum number used in problems
- Optional settings:
  - Allow negative answers (for subtraction)
  - Only whole number results (for division)
  - Include zero as a possible operand
- Automatically arranges questions into 2 or 3 columns based on quantity
- Generates a downloadable PDF with space for answers, name, date, and score

## 🛠️ Tech Stack

- [React](https://reactjs.org/)
- [jsPDF](https://github.com/parallax/jsPDF)
- [Tailwind CSS](https://tailwindcss.com/) (for styling)
- Custom UI components (`Input`, `Button`, `Card`, `RadioGroup`)

## 🚀 Getting Started

1. **Install dependencies**

```
npm install
```

2. **Start development server**

```
npm run dev
```
3. **Build for production**

```
npm run build
```
## 📦 Dependencies Used
- react, react-dom
- jspdf
- tailwindcss and custom UI components (no external UI library)

## 📄 License
MIT License
## Build Docker Image
`docker build -t dilladev-math-fe:latest .`

## Tag Docker Image
`docker tag dilladev-math-fe:latest dilladev.azurecr.io/dilladev-math-fe:latest`

## Push Docker Image to Docker Hub
`docker push dilladev.azurecr.io/dilladev-math-fe:latest`

```
docker build -t dilladev-math-fe:latest .
docker tag dilladev-math-fe:latest dilladev.azurecr.io/dilladev-math-fe:latest
docker push dilladev.azurecr.io/dilladev-math-fe:latest
```

## Build Docker Image
`docker build -t dilladev-math-be:latest .`

## Tag Docker Image
`docker tag dilladev-math-be:latest dilladev.azurecr.io/dilladev-math-be:latest`

## Push Docker Image to Docker Hub
`docker push dilladev.azurecr.io/dilladev-math-be:latest`

```
docker build -t dilladev-math-be:latest .
docker tag dilladev-math-be:latest dilladev.azurecr.io/dilladev-math-be:latest
docker push dilladev.azurecr.io/dilladev-math-be:latest
```

```
docker build -t dilladev-math-base-fe:latest --build-arg VITE_BASE=/math/ . 
docker tag dilladev-math-base-fe:latest dilladev.azurecr.io/dilladev-math-base-fe:latest
docker push dilladev.azurecr.io/dilladev-math-base-fe:latest
```