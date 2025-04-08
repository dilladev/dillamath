import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent } from './components/ui/card';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import jsPDF from 'jspdf';

export default function MathWorksheetGenerator() {
  // State variables for worksheet settings
  const [numQuestions, setNumQuestions] = useState(10);
  const [operation, setOperation] = useState('addition');
  const [maxNumber, setMaxNumber] = useState(10);
  const [allowNegatives, setAllowNegatives] = useState(false);
  const [wholeDivision, setWholeDivision] = useState(true);
  const [allowZero, setAllowZero] = useState(false);

  // Generate an array of math problems based on user settings
  const generateProblems = () => {
    const problems = [];
    const ops = {
      addition: '+',
      subtraction: '-',
      multiplication: '×',
      division: '÷'
    };

    for (let i = 0; i < numQuestions; i++) {
      let a, b;
      do {
        a = Math.floor(Math.random() * (maxNumber + 1));
        b = Math.floor(Math.random() * (maxNumber + 1));
      } while (!allowZero && (a === 0 || b === 0));

      // Ensure non-negative results if subtraction and not allowing negatives
      if (operation === 'subtraction' && !allowNegatives && a < b) {
        [a, b] = [b, a];
      }

      // Adjust numbers for whole number division results if enabled
      if (operation === 'division') {
        b = Math.max(1, b); // avoid division by zero
        if (wholeDivision) {
          a = a - (a % b); // make 'a' divisible by 'b'
        }
      }

      // Ensures 'a' is not zero
      if(a == 0){
        i--;
      }
      else{
        problems.push({ a, b, op: ops[operation] });
      }
    }
    return problems;
  };

  // Add worksheet header to each PDF page
  const addPageHeader = (doc) => {
    doc.setFontSize(12);
    doc.text('Name: ________________________', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ____________`, 150, 20);
    doc.text(`Score: ______ / ${numQuestions}`, 20, 30);
  };

  // Generate PDF layout and render the problems
  const generatePDF = () => {
    const doc = new jsPDF();
    const problems = generateProblems();
    const colCount = 3;
    const pageWidth = 190;
    const marginX = 20;
    const colWidth = (pageWidth - marginX) / colCount;
    const rowHeight = 40;
    let xStart = marginX;
    let yStart = 50;
    let x = xStart;
    let y = yStart;

    addPageHeader(doc);

    problems.forEach((p, i) => {
      // Start new page if past page bottom
      if (y > 260) {
        doc.addPage();
        addPageHeader(doc);
        y = yStart;
        x = xStart;
      }

      // Calculate alignment for problem
      const aStr = p.a.toString();
      const bStr = p.b.toString();
      const aWidth = doc.getTextWidth(aStr);
      const bWidth = doc.getTextWidth(`${p.op} ${bStr}`);
      const maxWidth = Math.max(aWidth, bWidth);
      const problemX = x + (colWidth + maxWidth) / 2;

      // Render the problem text and answer line
      doc.setFontSize(16);
      doc.text(`${i + 1}.`, x, y);
      doc.text(aStr, problemX - aWidth, y);
      doc.text(`${p.op} ${bStr}`, problemX - bWidth, y + 10);
      doc.line(problemX - maxWidth, y + 12, problemX, y + 12);

      // Move to next column/row
      x += colWidth;
      if (x + colWidth > pageWidth) {
        x = xStart;
        y += rowHeight;
      }
    });

    doc.save('math-worksheet.pdf');
  };

  // UI Layout
  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Math Worksheet Generator</h1>
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
            <label className="block font-medium">Operation</label>
            <RadioGroup value={operation} onValueChange={setOperation} defaultValue="addition">
              <RadioGroupItem value="addition" label="Addition" />
              <RadioGroupItem value="subtraction" label="Subtraction" />
              <RadioGroupItem value="multiplication" label="Multiplication" />
              <RadioGroupItem value="division" label="Division" />
            </RadioGroup>
          </div>

          {/* Conditional Option for Subtraction */}
          {operation === 'subtraction' && (
            <div>
              <label className="block font-medium">
                <input
                  type="checkbox"
                  checked={allowNegatives}
                  onChange={(e) => setAllowNegatives(e.target.checked)}
                  className="mr-2"
                />
                Allow Negative Answers
              </label>
            </div>
          )}

          {/* Conditional Option for Division */}
          {operation === 'division' && (
            <div>
              <label className="block font-medium">
                <input
                  type="checkbox"
                  checked={wholeDivision}
                  onChange={(e) => setWholeDivision(e.target.checked)}
                  className="mr-2"
                />
                Whole Number Answers Only
              </label>
            </div>
          )}

          {/* Option to Allow Zeros */}
          <div>
            <label className="block font-medium">
              <input
                type="checkbox"
                checked={allowZero}
                onChange={(e) => setAllowZero(e.target.checked)}
                className="mr-2"
              />
              Allow Zeros in Problems
            </label>
          </div>

          {/* Maximum Number Input */}
          <div>
            <label className="block font-medium">Largest Number</label>
            <Input
              type="number"
              value={maxNumber}
              onChange={(e) => setMaxNumber(Number(e.target.value))}
              min={1}
            />
          </div>

          {/* Generate PDF Button */}
          <Button onClick={generatePDF}>Generate PDF</Button>
        </CardContent>
      </Card>
    </div>
  );
}
