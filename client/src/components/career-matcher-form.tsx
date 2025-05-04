import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getCareerRecommendation } from "@/lib/openai";
import { CareerRecommendation } from "@shared/schema";
import StepProgress from "@/components/step-progress";
import RadioQuestion from "@/components/question-types/radio-question";
import CheckboxQuestion from "@/components/question-types/checkbox-question";
import TextQuestion from "@/components/question-types/text-question";
import ResultsDisplay from "@/components/results-display";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CareerMatcherForm: React.FC = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formResponses, setFormResponses] = useState<Record<string, string | string[]>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<CareerRecommendation | null>(null);

  // Definizione dei campi obbligatori per ogni step
  const requiredFields = {
    1: ["math_problem_solving", "tech_interests", "project_description", "problem_solving_style", "learning_preference", "communication_style"],
    2: ["team_preference", "hw_sw_preference", "motivations", "work_environment", "work_life_balance"],
    3: ["tech_experience", "experience_level", "career_goals", "education_level", "industries_interest"]
  };

  // Mutation for submitting form data to get career recommendation
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: getCareerRecommendation,
    onSuccess: (data) => {
      setResult(data);
      setCurrentStep(4); // Move to results step
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile ottenere la consulenza di carriera",
        variant: "destructive",
      });
    },
  });

  // Update responses when a field changes
  const handleFieldChange = (name: string, value: string | string[]) => {
    setFormResponses((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Rimuovi l'errore di validazione quando il campo viene compilato
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: false
      }));
    }
  };

  // Validate current step fields
  const validateCurrentStep = () => {
    const currentRequiredFields = requiredFields[currentStep as 1 | 2 | 3] || [];
    let hasErrors = false;
    const newErrors: Record<string, boolean> = {};
    
    currentRequiredFields.forEach(field => {
      const value = formResponses[field];
      const isEmpty = value === undefined || 
                      value === "" || 
                      (Array.isArray(value) && value.length === 0);
      
      if (isEmpty) {
        newErrors[field] = true;
        hasErrors = true;
      }
    });
    
    setValidationErrors(newErrors);
    return !hasErrors;
  };

  // Go to next step
  const goToNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast({
        title: "Campi obbligatori",
        description: "Compila tutti i campi obbligatori prima di continuare",
        variant: "destructive",
      });
    }
  };

  // Go to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit form to get career recommendation
  const submitForm = () => {
    if (validateCurrentStep()) {
      mutate(formResponses);
    } else {
      toast({
        title: "Campi obbligatori",
        description: "Compila tutti i campi obbligatori prima di inviare",
        variant: "destructive",
      });
    }
  };

  // Start over - reset form
  const startOver = () => {
    setCurrentStep(1);
    setFormResponses({});
    setValidationErrors({});
    setResult(null);
  };

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Progress Tracker */}
      <StepProgress currentStep={currentStep} />
      
      {/* Step 1: Interessi */}
      {currentStep === 1 && (
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">I Tuoi Interessi e le Tue Attitudini</h2>
          <p className="text-gray-600 mb-6">Aiutaci a comprendere quali attività e approcci alla risoluzione dei problemi preferisci.</p>
          
          <div className="space-y-6">
            {/* Single Choice Question */}
            <RadioQuestion
              label="Ti piace risolvere problemi che richiedono concetti matematici?"
              name="math_problem_solving"
              options={[
                {
                  value: "yes",
                  title: "Sì, mi piacciono le sfide matematiche",
                  description: "Trovo soddisfazione nel risolvere problemi con formule e calcoli",
                },
                {
                  value: "sometimes",
                  title: "A volte, dipende dal contesto",
                  description: "Posso lavorare con la matematica quando necessario, ma non è la mia attività preferita",
                },
                {
                  value: "no",
                  title: "No, preferisco altri approcci",
                  description: "Tendo ad evitare problemi matematici quando possibile",
                },
              ]}
              value={formResponses.math_problem_solving as string || ""}
              onChange={(value) => handleFieldChange("math_problem_solving", value)}
            />

            {/* Multiple Choice Question */}
            <CheckboxQuestion
              label="Quali aspetti del lavoro ti interessano di più? (Seleziona tutte le opzioni applicabili)"
              name="tech_interests"
              options={[
                {
                  value: "visual_design",
                  title: "Design visivo e interfacce utente",
                  description: "Creare esperienze attraenti e intuitive per gli utenti",
                },
                {
                  value: "data_analysis",
                  title: "Analisi dati e approfondimenti",
                  description: "Trovare modelli ed estrarre significato dalle informazioni",
                },
                {
                  value: "system_architecture",
                  title: "Organizzazione e gestione di sistemi",
                  description: "Progettare come diversi componenti lavorano insieme",
                },
                {
                  value: "automation",
                  title: "Automazione ed efficienza",
                  description: "Creare sistemi che riducono il lavoro manuale",
                },
              ]}
              value={formResponses.tech_interests as string[] || []}
              onChange={(value) => handleFieldChange("tech_interests", value)}
            />

            {/* Open-ended Question */}
            <TextQuestion
              label="Descrivi un progetto o un'attività (lavorativa o non) che hai davvero apprezzato."
              name="project_description"
              placeholder="Raccontaci cosa ti è piaciuto, quali sfide hai affrontato e perché è stato significativo per te..."
              helperText="La tua risposta ci aiuta a capire che tipo di lavoro ti dà energia."
              value={formResponses.project_description as string || ""}
              onChange={(value) => handleFieldChange("project_description", value)}
            />
            
            {/* New Single Choice Question */}
            <RadioQuestion
              label="Quale stile di problem solving descrive meglio il tuo approccio?"
              name="problem_solving_style"
              options={[
                {
                  value: "analytical",
                  title: "Analitico e metodico",
                  description: "Preferisco scomporre problemi complessi e affrontarli sistematicamente",
                },
                {
                  value: "creative",
                  title: "Creativo e intuitivo",
                  description: "Mi affido all'intuizione e cerco soluzioni innovative fuori dagli schemi",
                },
                {
                  value: "collaborative",
                  title: "Collaborativo e discussivo",
                  description: "Preferisco confrontarmi con altri per trovare soluzioni condivise",
                },
                {
                  value: "practical",
                  title: "Pratico e concreto",
                  description: "Mi concentro su soluzioni realizzabili e risultati immediati",
                },
              ]}
              value={formResponses.problem_solving_style as string || ""}
              onChange={(value) => handleFieldChange("problem_solving_style", value)}
            />
            
            {/* New Single Choice Question */}
            <RadioQuestion
              label="Come preferisci imparare nuove competenze?"
              name="learning_preference"
              options={[
                {
                  value: "theoretical",
                  title: "Studio teorico approfondito",
                  description: "Preferisco comprendere i principi fondamentali prima di applicarli",
                },
                {
                  value: "practical",
                  title: "Apprendimento pratico",
                  description: "Imparo meglio facendo e sperimentando direttamente",
                },
                {
                  value: "observational",
                  title: "Osservazione e imitazione",
                  description: "Preferisco osservare esempi e modelli da seguire",
                },
                {
                  value: "social",
                  title: "Apprendimento collaborativo",
                  description: "Imparo meglio attraverso discussioni e scambi con gli altri",
                },
              ]}
              value={formResponses.learning_preference as string || ""}
              onChange={(value) => handleFieldChange("learning_preference", value)}
            />

            {/* New Single Choice Question */}
            <RadioQuestion
              label="Quale stile di comunicazione ti rappresenta meglio?"
              name="communication_style"
              options={[
                {
                  value: "direct",
                  title: "Diretto e conciso",
                  description: "Preferisco andare dritto al punto ed essere chiaro e preciso",
                },
                {
                  value: "detailed",
                  title: "Dettagliato e approfondito",
                  description: "Fornisco spiegazioni complete e considero tutti gli aspetti",
                },
                {
                  value: "visual",
                  title: "Visivo e illustrativo",
                  description: "Uso immagini, metafore e analogie per esprimere concetti",
                },
                {
                  value: "emotional",
                  title: "Empatico e relazionale",
                  description: "Mi concentro sulle relazioni interpersonali e sulle emozioni",
                },
              ]}
              value={formResponses.communication_style as string || ""}
              onChange={(value) => handleFieldChange("communication_style", value)}
            />
          </div>
          
          {validationErrors && Object.keys(validationErrors).length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Compila tutti i campi obbligatori prima di procedere.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-8 flex justify-end">
            <Button onClick={goToNextStep}>
              Continua alle Preferenze
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Preferenze */}
      {currentStep === 2 && (
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Le Tue Preferenze Professionali</h2>
          <p className="text-gray-600 mb-6">Indicaci come preferisci lavorare e quali contesti lavorativi si adattano meglio alle tue esigenze e aspirazioni.</p>
          
          <div className="space-y-6">
            {/* Single Choice Question */}
            <RadioQuestion
              label="Preferisci lavorare in modo indipendente o come parte di un team?"
              name="team_preference"
              options={[
                {
                  value: "independent",
                  title: "Principalmente in autonomia",
                  description: "Preferisco lavorare da solo ed essere responsabile dei miei compiti",
                },
                {
                  value: "balanced",
                  title: "Un equilibrio tra i due",
                  description: "Mi piace collaborare ma ho anche bisogno di tempo per lavorare in autonomia",
                },
                {
                  value: "team",
                  title: "Principalmente in team",
                  description: "Prospero in ambienti collaborativi e mi piace lavorare con gli altri",
                },
              ]}
              value={formResponses.team_preference as string || ""}
              onChange={(value) => handleFieldChange("team_preference", value)}
            />

            {/* Single Choice Question */}
            <RadioQuestion
              label="Preferisci lavorare con aspetti concreti o concettuali?"
              name="hw_sw_preference"
              options={[
                {
                  value: "hardware",
                  title: "Aspetti concreti",
                  description: "Mi piace lavorare con componenti e sistemi fisici",
                },
                {
                  value: "both",
                  title: "Entrambi in egual misura",
                  description: "Sono interessato a come gli aspetti pratici e teorici interagiscono",
                },
                {
                  value: "software",
                  title: "Aspetti concettuali",
                  description: "Preferisco lavorare con idee, concetti e soluzioni teoriche",
                },
              ]}
              value={formResponses.hw_sw_preference as string || ""}
              onChange={(value) => handleFieldChange("hw_sw_preference", value)}
            />

            {/* Multiple Choice Question */}
            <CheckboxQuestion
              label="Cosa ti motiva nel tuo lavoro? (Seleziona tutte le opzioni applicabili)"
              name="motivations"
              options={[
                {
                  value: "creative_freedom",
                  title: "Libertà creativa",
                  description: "La possibilità di innovare ed esprimere le mie idee",
                },
                {
                  value: "technical_challenge",
                  title: "Sfide stimolanti",
                  description: "Risolvere problemi complessi che mettono alla prova le mie capacità",
                },
                {
                  value: "user_impact",
                  title: "Impatto sulle persone",
                  description: "Creare soluzioni che aiutano direttamente le persone",
                },
                {
                  value: "business_outcomes",
                  title: "Risultati aziendali",
                  description: "Vedere il mio lavoro generare risultati misurabili per le organizzazioni",
                },
              ]}
              value={formResponses.motivations as string[] || []}
              onChange={(value) => handleFieldChange("motivations", value)}
            />

            {/* New Single Choice Question */}
            <RadioQuestion
              label="Quale ambiente di lavoro preferisci?"
              name="work_environment"
              options={[
                {
                  value: "corporate",
                  title: "Grande azienda",
                  description: "Struttura organizzata, processi definiti, maggiore stabilità",
                },
                {
                  value: "startup",
                  title: "Startup",
                  description: "Ambiente dinamico, ruoli flessibili, rapida crescita",
                },
                {
                  value: "freelance",
                  title: "Lavoro autonomo",
                  description: "Libertà di scelta dei progetti, autonomia gestionale",
                },
                {
                  value: "nonprofit",
                  title: "No-profit",
                  description: "Orientamento alla missione sociale, impatto sulla comunità",
                },
              ]}
              value={formResponses.work_environment as string || ""}
              onChange={(value) => handleFieldChange("work_environment", value)}
            />

            {/* New Single Choice Question */}
            <RadioQuestion
              label="Quanto è importante per te l'equilibrio tra lavoro e vita privata?"
              name="work_life_balance"
              options={[
                {
                  value: "very_important",
                  title: "Molto importante",
                  description: "Priorità a orari flessibili e tempo personale",
                },
                {
                  value: "important",
                  title: "Importante",
                  description: "Cerco un buon equilibrio ma posso essere flessibile",
                },
                {
                  value: "somewhat_important",
                  title: "Abbastanza importante",
                  description: "Mi adatto alle esigenze del lavoro quando necessario",
                },
                {
                  value: "not_priority",
                  title: "Non è una priorità",
                  description: "Sono disposto a dedicare molto tempo al lavoro per la mia carriera",
                },
              ]}
              value={formResponses.work_life_balance as string || ""}
              onChange={(value) => handleFieldChange("work_life_balance", value)}
            />
          </div>
          
          {validationErrors && Object.keys(validationErrors).length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Compila tutti i campi obbligatori prima di procedere.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={goToPreviousStep}>
              Torna agli Interessi
            </Button>
            <Button onClick={goToNextStep}>
              Continua all'Esperienza
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Esperienza */}
      {currentStep === 3 && (
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Il Tuo Percorso Formativo e Professionale</h2>
          <p className="text-gray-600 mb-6">Raccontaci del tuo percorso educativo, delle competenze acquisite e delle esperienze che hanno contribuito alla tua formazione professionale.</p>
          
          <div className="space-y-6">
            {/* Multiple Choice Question */}
            <CheckboxQuestion
              label="Quali competenze hai già acquisito o sviluppato? (Seleziona tutte le opzioni applicabili)"
              name="tech_experience"
              options={[
                { value: "communication", title: "Comunicazione", description: "Capacità di esprimersi chiaramente" },
                { value: "analytical", title: "Pensiero analitico", description: "Analisi di problemi e situazioni" },
                { value: "management", title: "Gestione", description: "Coordinare persone o progetti" },
                { value: "creative", title: "Creatività", description: "Generare nuove idee e soluzioni" },
                { value: "technical", title: "Competenze tecniche", description: "Conoscenze specialistiche" },
                { value: "languages", title: "Lingue straniere", description: "Comunicare in più lingue" },
                { value: "teaching", title: "Insegnamento", description: "Trasferire conoscenze ad altri" },
                { value: "none", title: "Nessuna in particolare", description: "Ancora in fase di sviluppo" },
              ]}
              layout="grid"
              value={formResponses.tech_experience as string[] || []}
              onChange={(value) => handleFieldChange("tech_experience", value)}
            />

            {/* Single Choice Question */}
            <RadioQuestion
              label="Qual è il tuo attuale livello di esperienza lavorativa?"
              name="experience_level"
              options={[
                {
                  value: "beginner",
                  title: "Principiante",
                  description: "Studente o all'inizio della carriera lavorativa",
                },
                {
                  value: "intermediate",
                  title: "Intermedio",
                  description: "Alcuni anni di esperienza o progetti completati",
                },
                {
                  value: "advanced",
                  title: "Avanzato",
                  description: "Significativa esperienza professionale o specializzazione",
                },
              ]}
              value={formResponses.experience_level as string || ""}
              onChange={(value) => handleFieldChange("experience_level", value)}
            />

            {/* Open-ended Question */}
            <TextQuestion
              label="Quali sono i tuoi obiettivi e aspirazioni professionali?"
              name="career_goals"
              placeholder="Raccontaci cosa speri di realizzare nella tua carriera..."
              value={formResponses.career_goals as string || ""}
              onChange={(value) => handleFieldChange("career_goals", value)}
            />
            
            {/* New Single Choice Question */}
            <RadioQuestion
              label="Qual è il tuo livello di istruzione attuale o previsto?"
              name="education_level"
              options={[
                {
                  value: "high_school",
                  title: "Diploma di scuola superiore",
                  description: "Ho completato o sto completando la scuola superiore",
                },
                {
                  value: "bachelor",
                  title: "Laurea triennale",
                  description: "Ho completato o sto completando una laurea triennale",
                },
                {
                  value: "master",
                  title: "Laurea magistrale",
                  description: "Ho completato o sto completando una laurea magistrale",
                },
                {
                  value: "phd",
                  title: "Dottorato o specializzazione",
                  description: "Ho completato o sto completando un dottorato o una specializzazione",
                },
              ]}
              value={formResponses.education_level as string || ""}
              onChange={(value) => handleFieldChange("education_level", value)}
            />
            
            {/* New Multiple Choice Question */}
            <CheckboxQuestion
              label="In quali settori sei interessato a lavorare? (Seleziona tutte le opzioni applicabili)"
              name="industries_interest"
              options={[
                { value: "technology", title: "Tecnologia", description: "IT, software, hardware, telecomunicazioni" },
                { value: "health", title: "Salute", description: "Sanità, medicina, ricerca medica, benessere" },
                { value: "finance", title: "Finanza", description: "Banche, investimenti, assicurazioni" },
                { value: "education", title: "Istruzione", description: "Insegnamento, formazione, educazione" },
                { value: "creative", title: "Settori creativi", description: "Design, arti, media, intrattenimento" },
                { value: "manufacturing", title: "Produzione", description: "Manifattura, ingegneria, costruzioni" },
                { value: "retail", title: "Commercio", description: "Vendita al dettaglio, e-commerce" },
                { value: "nonprofit", title: "No-profit", description: "ONG, servizi sociali, volontariato" },
              ]}
              layout="grid"
              value={formResponses.industries_interest as string[] || []}
              onChange={(value) => handleFieldChange("industries_interest", value)}
            />
          </div>
          
          {validationErrors && Object.keys(validationErrors).length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Compila tutti i campi obbligatori prima di procedere.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={goToPreviousStep}>
              Torna alle Preferenze
            </Button>
            <Button onClick={submitForm} disabled={isPending}>
              Ottieni Consulenza di Carriera
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Risultati */}
      {currentStep === 4 && (
        <div className="p-6">
          {/* Loading State */}
          {isPending && (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
              <p className="mt-4 text-lg font-medium text-gray-700">Analisi delle tue risposte...</p>
              <p className="mt-2 text-gray-500 max-w-md text-center">
                La nostra IA sta valutando i tuoi interessi, preferenze ed esperienze per consigliarti il miglior percorso di carriera.
              </p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Qualcosa è andato storto</h3>
              <p className="mt-2 text-gray-500 max-w-md text-center">
                {error instanceof Error ? error.message : "Abbiamo riscontrato un errore durante l'elaborazione della tua richiesta. Riprova più tardi."}
              </p>
              <Button className="mt-4" onClick={submitForm}>
                Riprova
              </Button>
            </div>
          )}

          {/* Results State */}
          {!isPending && !isError && result && (
            <ResultsDisplay 
              result={result} 
              onStartOver={startOver} 
            />
          )}
        </div>
      )}
    </Card>
  );
};

export default CareerMatcherForm;
