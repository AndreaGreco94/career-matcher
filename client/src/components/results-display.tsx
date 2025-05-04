import React from "react";
import { CareerRecommendation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface ResultsDisplayProps {
  result: CareerRecommendation;
  onStartOver: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onStartOver }) => {
  const { careerTitle, explanation, alternativeCareers, nextSteps } = result;

  const downloadResults = () => {
    // Create a text version of the results
    const content = `
Consulenza di Carriera: ${careerTitle}

${explanation}

${nextSteps ? `\nProssimi Passi Consigliati:\n${nextSteps.map(step => `- ${step}`).join('\n')}` : ''}

${alternativeCareers ? `\nPercorsi Alternativi da Considerare:\n${alternativeCareers.map(career => `- ${career.title}: ${career.description}`).join('\n')}` : ''}
    `.trim();

    // Create a Blob with the content
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `consulenza-carriera-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary mb-4">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Il Tuo Percorso di Carriera Consigliato</h2>
        <p className="text-gray-600 mt-1">Basato sulla tua combinazione unica di interessi, preferenze e competenze</p>
      </div>

      {/* Career Recommendation Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="bg-primary-700 px-6 py-4">
          <h3 className="text-xl font-bold text-white">{careerTitle}</h3>
        </div>
        <div className="p-6">
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{explanation}</p>
            
            {nextSteps && nextSteps.length > 0 && (
              <>
                <h4 className="text-lg font-semibold mt-4">Prossimi Passi Consigliati:</h4>
                <ul>
                  {nextSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Alternative Careers */}
      {alternativeCareers && alternativeCareers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Percorsi Alternativi da Considerare</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alternativeCareers.map((career, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-primary-700">{career.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{career.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onStartOver}>
          Ricomincia
        </Button>
        <Button onClick={downloadResults}>
          Scarica Risultati
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
