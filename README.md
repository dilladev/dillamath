# 🧮 DillaMath - A Math Worksheet Generator

A simple and customizable React tool to generate printable math worksheets as PDF files. Ideal for teachers, homeschoolers, tutors, or anyone needing quick and clean practice sheets for addition, subtraction, multiplication, or division.

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