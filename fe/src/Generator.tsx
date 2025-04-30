import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent } from './components/ui/card';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Switch } from './components/ui/switch';
import jsPDF from 'jspdf';

export default function MathWorksheetGenerator() {
  // ====== State Management ======
  const [numQuestions, setNumQuestions] = useState(10);
  const [operation, setOperation] = useState('addition');
  const [maxNumber, setMaxNumber] = useState(10);
  const [allowNegatives, setAllowNegatives] = useState(false);
  const [wholeDivision, setWholeDivision] = useState(true);
  const [allowZero, setAllowZero] = useState(false);
  const [allowOne, setAllowOne] = useState(false);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [showBoxes, setShowBoxes] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [multiplicationFacts, setMultiplicationFacts] = useState<number[]>([]);

  const generateProblems = () => {
    const problems = [];
    const seen = new Set();
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

      if (operation === 'multiplication' && multiplicationFacts.length > 0) {
        a = multiplicationFacts[Math.floor(Math.random() * multiplicationFacts.length)];
      }

      if (!allowZero && (a === 0 || b === 0)) continue;
      if (!allowOne && (a === 1 || b === 1)) continue;

      if (operation === 'subtraction' && !allowNegatives && a < b) {
        [a, b] = [b, a];
      }

      if (operation === 'division') {
        b = Math.max(1, b);
        if (wholeDivision) {
          a = a - (a % b);
        }
      }

      if (a !== 0 && (allowOne || correctAnswer({ a, b, op: ops[operation] }) !== 1)) {
        const key = `${a}${ops[operation]}${b}`;
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

  const generateChoices = (correct: number) => {
    const choices = new Set([correct]);
    while (choices.size < 4) {
      const offset = Math.floor(Math.random() * 11) - 5;
      const distractor = correct + offset;
      if (distractor !== correct && distractor >= 0) {
        choices.add(distractor);
      }
    }
    return Array.from(choices).sort((a, b) => a - b);
  };

  const addPageHeader = (doc: jsPDF, actualCount: number) => {
    doc.setFontSize(12);
    doc.text('Name: ________________________', 20, 20);
    doc.text(`Date: ____________`, 150, 20);
    doc.text(`Score: ______ / ${actualCount}`, 20, 30);
  };

  const correctAnswer = (p: { a: number; b: number; op: string }) => {
    return eval(`${p.a} ${p.op === '×' ? '*' : p.op === '÷' ? '/' : p.op} ${p.b}`);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const problems = generateProblems();
    const actualCount = problems.length;
    const colCount = 5;
    const pageWidth = 190;
    const marginX = 20;
    const colWidth = (pageWidth - marginX) / colCount;
    const rowHeight = multipleChoice ? 60 : 30;
    let xStart = marginX;
    let yStart = 45;
    let x = xStart;
    let y = yStart;

    addPageHeader(doc, actualCount);

    problems.forEach((p, i) => {
      if (y > 250) {
        doc.addPage();
        addPageHeader(doc,actualCount);
        y = yStart;
        x = xStart;
      }

      const aStr = p.a.toString();
      const bStr = `${p.op} ${p.b}`;
      const answer = correctAnswer(p);

      doc.setFontSize(14);
      doc.text(`${i + 1}.`, x, y);
      doc.text(aStr, x + 20, y, { align: 'right' });
      doc.text(bStr, x + 20, y + 7, { align: 'right' });
      doc.line(x + 8, y + 10, x + colWidth - 10, y + 10);

      if (showBoxes) {
        const yOffset = 7;
        const xOffset = 5;
        doc.line(x - xOffset, y - yOffset, x + colWidth - xOffset, y - yOffset);
        doc.line(x + colWidth - xOffset, y - yOffset, x + colWidth - xOffset, y + rowHeight - yOffset);
        doc.line(x + colWidth - xOffset, y + rowHeight - yOffset, x - xOffset, y + rowHeight - yOffset);
        doc.line(x - xOffset, y + rowHeight - yOffset, x - xOffset, y - yOffset);
      }

      if (multipleChoice) {
        const choices = generateChoices(answer);
        const labels = ['A', 'B', 'C', 'D'];

        choices.forEach((choice, idx) => {
          const bubbleX = x + 2;
          const bubbleY = y + 25 + idx * 7;
          doc.circle(bubbleX, bubbleY, 2);
          doc.text(`${labels[idx]}. ${choice}`, bubbleX + 6, bubbleY + 1.5);
        });
      }

      x += colWidth;
      if (x + colWidth > pageWidth) {
        x = xStart;
        y += rowHeight;
      }
    });

    if (showAnswers) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Answer Sheet', 20, 20);
      doc.setFontSize(12);

      problems.forEach((p, i) => {
        const answer = correctAnswer(p);
        doc.text(`${i + 1}. ${answer}`, 20, 30 + i * 8);
      });
    }

    doc.save('math-worksheet.pdf');
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Math Worksheet Generator</h1>
      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <label className="block font-medium">Number of Questions</label>
            <Input type="number" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} min={1} />
          </div>

          <div>
            <label className="block font-medium mb-1">Operation</label>
            <RadioGroup value={operation} onValueChange={setOperation} className="space-y-2">
              <RadioGroupItem value="addition" label="Addition" />
              <RadioGroupItem value="subtraction" label="Subtraction" />
              <RadioGroupItem value="multiplication" label="Multiplication" />
              <RadioGroupItem value="division" label="Division" />
            </RadioGroup>
          </div>

          {operation === 'multiplication' && (
  <div>
    <label className="block font-medium mb-1">Multiplication Facts</label>
    <div className="grid grid-cols-4 gap-2">
      {[...Array(11)].map((_, i) => {
        const fact = i + 2;
        const isSelected = multiplicationFacts.includes(fact);
        return (
          <label key={fact} className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                setMultiplicationFacts((prev) =>
                  e.target.checked
                    ? [...prev, fact]
                    : prev.filter((f) => f !== fact)
                );
              }}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{fact}</span>
          </label>
        );
      })}
    </div>
  </div>
)}


          <div className="flex items-center">
            <Switch checked={allowNegatives} onCheckedChange={setAllowNegatives} />
            <label className="font-medium ml-2">Allow Negative Answers</label>
          </div>

          <div className="flex items-center">
            <Switch checked={wholeDivision} onCheckedChange={setWholeDivision} />
            <label className="font-medium ml-2">Whole Number Division Only</label>
          </div>

          <div className="flex items-center">
            <Switch checked={allowZero} onCheckedChange={setAllowZero} />
            <label className="font-medium ml-2">Allow Zeros</label>
          </div>

          <div className="flex items-center">
            <Switch checked={allowOne} onCheckedChange={setAllowOne} />
            <label className="font-medium ml-2">Allow Ones</label>
          </div>

          <div className="flex items-center">
            <Switch checked={multipleChoice} onCheckedChange={setMultipleChoice} />
            <label className="font-medium ml-2">Use Multiple Choice</label>
          </div>

          <div className="flex items-center">
            <Switch checked={showBoxes} onCheckedChange={setShowBoxes} />
            <label className="font-medium ml-2">Show Boxes</label>
          </div>

          <div className="flex items-center">
            <Switch checked={showAnswers} onCheckedChange={setShowAnswers} />
            <label className="font-medium ml-2">Show Answer Sheet</label>
          </div>

          <div>
            <label className="block font-medium">Largest Number</label>
            <Input type="number" value={maxNumber} onChange={(e) => setMaxNumber(Number(e.target.value))} min={1} />
          </div>

          <Button onClick={generatePDF}>Generate PDF</Button>
        </CardContent>
      </Card>
    </div>
  );
}
