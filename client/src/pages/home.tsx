import React from "react";
import CareerMatcherForm from "@/components/career-matcher-form";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <h1 className="ml-2 text-xl font-bold text-gray-900">Consulente di Carriera</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#" className="text-gray-500 hover:text-primary font-medium">Chi Siamo</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary font-medium">Risorse</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary font-medium">Contatti</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CareerMatcherForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Informativa Privacy</span>
                <span className="text-sm text-gray-500 hover:text-gray-600">Informativa Privacy</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Termini di Servizio</span>
                <span className="text-sm text-gray-500 hover:text-gray-600">Termini di Servizio</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Contatti</span>
                <span className="text-sm text-gray-500 hover:text-gray-600">Contatti</span>
              </a>
            </div>
            <p className="mt-4 text-center md:mt-0 md:text-right text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Consulente di Carriera. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
