'use client'
import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey: string = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";

const dropdownOptions: Record<string, string[]> = {
  Algorithm: ["Shor's Algorithm", "Grover's Algorithm", "QAOA", "VQE", "QFT", "QPE", "Deutsch-Jozsa Algorithm", "Bernstein-Vazirani Algorithm", "Simon’s Algorithm", "HHL", "Quantum Walk Algorithms", "Amplitude Amplification", "QGAN", "QSVM", "Quantum Annealing"],
  "Qubit Count": ["2", "4", "8", "16", "32"],
  Gate: ["Hadamard", "CNOT", "Pauli-X", "Pauli-Y", "Pauli-Z", "Clifford", "T-Gate", "Toffoli", "Fredkin", "S-Phase", "T-Phase", "Rotation", "Controlled-U", "Controlled-Z","Swap"],
  Connectivity: ["Full", "Linear", "Circular", "Custom", "Heavy-Hex", "Star-Topology", "Chain", "Bus", "Ring"],
  "Error Rate": ["Low", "Medium", "High", "Qubit Crosstalk"],
  Optimization: ["Gate Cancellation", "Gate Merging", "Qubit Mapping & Routing","Depth Reduction", "Template Matching", "Pauli Frame Optimization", "Clifford Circuit Optimization", "Variational Compilation"],
  Measure: ["Single Qubit", "Multi-Qubit", "All", "Weak Measurement", "QND"],
  Entanglement: ["Bell State", "GHZ State", "W State", "Cluster State"],
  Width: ["Narrow", "Medium", "Wide"],
  Depth: ["Shallow", "Medium", "Deep"],
};

const GenerationPanel: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [displayedCode, setDisplayedCode] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [circuitDiagram, setCircuitDiagram] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (category: keyof typeof dropdownOptions, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [category]: value }));
  };

  const handleGenerateCode = async () => {
    if (!apiKey) {
      setGeneratedCode("Error: Gemini API key is missing.");
      return;
    }

    if (Object.keys(selectedOptions).length === 0) {
      setGeneratedCode("Please select at least one option from the right panel.");
      return;
    }

    setIsGenerating(true);
    setGeneratedCode("");
    setDisplayedCode("");

    const prompt = `Generate a bug-free, robust, and scalable quantum circuit code using the following parameters:\n
    ${Object.entries(selectedOptions).map(([key, value]) => `${key}: ${value}`).join("\n")}\n
    Ensure the code is formatted properly and follows best practices.`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      const response = await model.generateContent(prompt);

      const generatedText = response.response.text()?.trim() || "Error generating code.";
      setGeneratedCode(generatedText);
      setIsTyping(true);
    } catch (error) {
      console.error("Error generating circuit:", error);
      setGeneratedCode("Error generating circuit. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!generatedCode || typeof generatedCode !== "string") return;

    let index = 0;
    setDisplayedCode("");

    const interval = setInterval(() => {
      if (index < generatedCode.length) {
        setDisplayedCode((prev) => prev + generatedCode[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [generatedCode]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleDisplayCircuit = async () => {
    if (!generatedCode) {
      alert("Please generate the quantum circuit code first before displaying the circuit.");
      return;
    }

    if (isTyping) {
      alert("Wait for the code to finish generating before displaying the circuit.");
      return;
    }

    if (!confirm("Make sure you have copied the code before generating the circuit. Proceed?")) {
      return;
    }

    setIsBuilding(true);
    setCircuitDiagram("");

    const circuitPrompt = `Based on the following quantum circuit code, generate a structured non-graphical representation of the circuit:\n
    Code:\n${generatedCode}\n
    Ensure the representation includes all gates, qubits, and connections clearly formatted for readability.
    Use the following structure:\n
    Qubit 0: ───H───●──────M───
                   │
    Qubit 1: ──────┼──X───M───
                   │
    Qubit 2: ──────┼──────M───
    Ensure accuracy and correctness without adding random gates or modifications.`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      const response = await model.generateContent(circuitPrompt);

      const generatedCircuit = response.response.text()?.trim() || "Error generating circuit.";
      setCircuitDiagram(generatedCircuit);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error generating circuit diagram:", error);
      setCircuitDiagram("Error generating circuit diagram. Please try again.");
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full p-4">
      {/* Left Section */}
      <div className="flex-1 flex flex-col items-center p-4 border">
        <span>
          <button 
            onClick={handleGenerateCode} 
            className="mb-4 p-2 border rounded"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Code"}
          </button>&nbsp;
          <button 
            onClick={handleDisplayCircuit} 
            className="mb-4 p-2 border rounded"
            disabled={isBuilding}
          >
            {isBuilding ? "Building..." : "Display Circuit"}
          </button>
        </span>

        <div className="w-full h-96 border p-2 bg-gray-100 overflow-auto relative">
          <pre className="whitespace-pre-wrap">
            {isGenerating ? "Generating..." : displayedCode || "Generated code will appear here..."}
          </pre>

          {!isTyping && generatedCode && !isGenerating && (
            <button 
              onClick={() => handleCopy(generatedCode)}
              className="absolute top-2 right-2 p-1 bg-gray-300 rounded text-sm"
            >
              Copy
            </button>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/4 flex flex-col space-y-2 p-4 border">
        {Object.keys(dropdownOptions).map((category) => (
          <div key={category} className="relative">
            <select
              className="p-2 border rounded w-full bg-white"
              value={selectedOptions[category] || ""}
              onChange={(e) => handleSelect(category, e.target.value)}
            >
              <option value="" disabled>{category}</option>
              {dropdownOptions[category].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Modal for Circuit Display */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-2">Circuit Diagram</h2>
            <pre className="whitespace-pre-wrap">{circuitDiagram}</pre>
            <button onClick={() => handleCopy(circuitDiagram)} className="mt-2 p-2 bg-blue-500 text-white rounded">
              Copy
            </button>
            <button onClick={() => setIsModalOpen(false)} className="mt-2 p-2 bg-gray-500 text-white rounded">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationPanel;
