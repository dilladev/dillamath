import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent } from './components/ui/card';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Switch } from './components/ui/switch';
import jsPDF from 'jspdf';

export default function MathWorksheetGenerator() {
  // State variables for worksheet settings
  const [numQuestions, setNumQuestions] = useState(10); // Total number of problems
  const [operation, setOperation] = useState('addition'); // Operation type
  const [maxNumber, setMaxNumber] = useState(10); // Largest number to be used
  const [allowNegatives, setAllowNegatives] = useState(false); // Whether to allow negative results
  const [wholeDivision, setWholeDivision] = useState(true); // Whether division must result in whole numbers
  const [allowZero, setAllowZero] = useState(false); // Whether zero can appear in problems
  const [allowOne, setAllowOne] = useState(false); // Whether one can appear in problems

  // Generates a unique list of math problems
  const generateProblems = () => {
    const problems = [];
    const seen = new Set(); // Track already generated problems to avoid duplicates
    const ops = {
      addition: '+',
      subtraction: '-',
      multiplication: '×',
      division: '÷'
    };

    let attempts = 0;
    while (problems.length < numQuestions && attempts < numQuestions * 20) {
      let a = Math.floor(Math.random() * (maxNumber + 1));
      let b = Math.floor(Math.random() * (maxNumber + 1));

      // Skip if values violate zero/one restrictions
      if (!allowZero && (a === 0 || b === 0)) continue;
      if (!allowOne && (a === 1 || b === 1)) continue;

      // Ensure non-negative subtraction result if not allowed
      if (operation === 'subtraction' && !allowNegatives && a < b) {
        [a, b] = [b, a];
      }

      // Ensure whole number division result if required
      if (operation === 'division') {
        b = Math.max(1, b); // Avoid division by 0
        if (wholeDivision) {
          a = a - (a % b); // Adjust 'a' to be divisible by 'b'
        }
      }

      // Ensure the top number is not 0
      if (a !== 0) {
        const key = `${a}${ops[operation]}${b}`; // Create unique key
        if (seen.has(key)) {
          attempts++;
          continue;
        }

        seen.add(key);
        problems.push({ a, b, op: ops[operation] });
      }
    }

    return problems;
  };

  // Adds a header to each page of the PDF
  const addPageHeader = (doc) => {
    doc.setFontSize(12);
    doc.text('Name: ________________________', 20, 20);
    doc.text(`Date: ____________`, 150, 20);
    doc.text(`Score: ______ / ${numQuestions}`, 20, 30);
  };

  // Creates and formats the PDF document
  const generatePDF = () => {
    const doc = new jsPDF();
    const problems = generateProblems();
    const colCount = 3; // Number of columns per row
    const pageWidth = 190;
    const marginX = 20;
    const colWidth = (pageWidth - marginX) / colCount;
    const rowHeight = 40; // Row height for padding
    let xStart = marginX;
    let yStart = 50;
    let x = xStart;
    let y = yStart;

    addPageHeader(doc);

    problems.forEach((p, i) => {
      // Create a new page if current one is full
      if (y > 260) {
        doc.addPage();
        addPageHeader(doc);
        y = yStart;
        x = xStart;
      }

      // Calculate spacing and alignment
      const aStr = p.a.toString();
      const bStr = p.b.toString();
      const aWidth = doc.getTextWidth(aStr);
      const bWidth = doc.getTextWidth(`${p.op} ${bStr}`);
      const maxWidth = Math.max(aWidth, bWidth);
      const problemX = x + (colWidth + maxWidth) / 2;

      // Draw the math problem and underline for answer
      doc.setFontSize(16);
      doc.text(`${i + 1}.`, x, y);
      doc.text(aStr, problemX - aWidth, y);
      doc.text(`${p.op} ${bStr}`, problemX - bWidth, y + 10);
      doc.line(problemX - maxWidth, y + 12, problemX, y + 12);

      // Move to next column or row
      x += colWidth;
      if (x + colWidth > pageWidth) {
        x = xStart;
        y += rowHeight;
      }
    });

    doc.save('math-worksheet.pdf');
  };

  // Main component UI rendering
  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Math Worksheet Generator</h1>
      <Card>
        <CardContent className="space-y-4 p-4">
          {/* Number of Questions Input */}
          <div>
            <label className="block font-medium">Number of Questions</label>
            <Input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              min={1}
            />
          </div>

          {/* Operation Selection */}
          <div>
            <label className="block font-medium mb-1">Operation</label>
            <RadioGroup value={operation} onValueChange={setOperation} className="space-y-2">
              <RadioGroupItem value="addition" label="Addition" />
              <RadioGroupItem value="subtraction" label="Subtraction" />
              <RadioGroupItem value="multiplication" label="Multiplication" />
              <RadioGroupItem value="division" label="Division" />
            </RadioGroup>
          </div>

          {/* Subtraction-specific option */}
          {operation === 'subtraction' && (
            <div className="flex items-center">
              <Switch checked={allowNegatives} onCheckedChange={setAllowNegatives} />
              <label className="font-medium">Allow Negative Answers</label>
            </div>
          )}

          {/* Division-specific option */}
          {operation === 'division' && (
            <div className="flex items-center">
              <Switch checked={wholeDivision} onCheckedChange={setWholeDivision} />
              <label className="font-medium">Whole Number Answers Only</label>
            </div>
          )}

          {/* General toggles */}
          <div className="flex items-center">
            <Switch checked={allowZero} onCheckedChange={setAllowZero} />
            <label className="font-medium">Allow Zeros in Problems</label>
          </div>

          <div className="flex items-center">
            <Switch checked={allowOne} onCheckedChange={setAllowOne} />
            <label className="font-medium">Allow Ones in Problems</label>
          </div>

          {/* Largest number setting */}
          <div>
            <label className="block font-medium">Largest Number</label>
            <Input
              type="number"
              value={maxNumber}
              onChange={(e) => setMaxNumber(Number(e.target.value))}
              min={1}
            />
          </div>

          {/* Generate worksheet button */}
          <Button onClick={generatePDF}>Generate PDF</Button>
        </CardContent>
      </Card>
    </div>
  );
}
