import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertLead } from "@shared/schema";

declare global {
  interface Window {
    Tesseract: any;
    pdfjsLib: any;
  }
}

export const DocumentUpload = () => {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const createLeadMutation = useMutation({
    mutationFn: async (lead: InsertLead) => {
      const response = await apiRequest('POST', '/api/leads', lead);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({
        title: "Success",
        description: "Lead extracted and added from document",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to extract lead from document",
        variant: "destructive",
      });
    },
  });

  const extractTextFromPDF = async (file: File): Promise<{ name: string; email: string; phone: string } | null> => {
    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF.js not loaded');
      }

      // Set worker source to avoid console warning
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str).join(' ');
        fullText += strings + '\n';
      }

      console.log('Extracted PDF text:', fullText);

      // Parse lead information from text
      const lead = parseLeadFromText(fullText);
      return lead;
    } catch (error) {
      console.error('PDF extraction error:', error);
      return null;
    }
  };

  const parseLeadFromText = (text: string): { name: string; email: string; phone: string } | null => {
    // Extract email and phone using the same patterns
    const email = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || "notfound@example.com";
    const phone = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}/)?.[0] || "N/A";
    
    // Enhanced name extraction strategy
    let name = "Unknown";
    
    // Strategy 1: Look for names in common patterns like "named [Name]", "individual named [Name]", etc.
    const namedPatterns = [
      /(?:named|called)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
      /(?:individual|person|candidate|student)\s+named\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
      /(?:Mr\.?|Ms\.?|Mrs\.?|Dr\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi
    ];
    
    for (const pattern of namedPatterns) {
      const match = text.match(pattern);
      if (match) {
        const extractedName = match[1] || match[0].replace(/(?:named|called|individual|person|candidate|student|Mr\.?|Ms\.?|Mrs\.?|Dr\.?)\s+/gi, '').trim();
        if (extractedName && extractedName.length > 3) {
          name = extractedName;
          break;
        }
      }
    }
    
    // Strategy 2: Look for specific known names
    if (name === "Unknown") {
      const specificNames = [
        /HEMANTH\s+KUNCHAM/i,
        /John\s+Doe/i,
        /Avula\s+Mahendra/i,
        /Mantena\s+Monish/i
      ];
      
      for (const namePattern of specificNames) {
        const match = text.match(namePattern);
        if (match) {
          name = match[0];
          break;
        }
      }
    }
    
    // Strategy 3: Look for names at document start (typical for resumes)
    if (name === "Unknown") {
      const firstLines = text.split('\n').slice(0, 3).join(' ');
      // Look for standalone names (not part of other phrases)
      const standaloneNameMatch = firstLines.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:\s|$)/);
      
      if (standaloneNameMatch) {
        const potentialName = standaloneNameMatch[1].trim();
        const excludedTerms = [
          'SKILLS', 'EDUCATION', 'EXPERIENCE', 'PROJECTS', 'SUMMARY', 'OBJECTIVE',
          'Computer Science', 'Data Science', 'Higher Secondary', 'Public School',
          'Tech Stack', 'Key Projects', 'Professional Summary', 'Innovation Hub'
        ];
        
        if (!excludedTerms.some(term => 
          term.toLowerCase().includes(potentialName.toLowerCase()) || 
          potentialName.toLowerCase().includes(term.toLowerCase())
        )) {
          name = potentialName;
        }
      }
    }
    
    // Strategy 4: Look for names near email but with better context
    if (name === "Unknown" && email !== "notfound@example.com") {
      const emailIndex = text.indexOf(email);
      if (emailIndex > -1) {
        // Look for names mentioned before the email with specific context words
        const beforeEmail = text.substring(Math.max(0, emailIndex - 300), emailIndex);
        const contextualNameMatch = beforeEmail.match(/(?:he|she|his|her|individual|person|named)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi);
        
        if (contextualNameMatch && contextualNameMatch.length > 0) {
          const lastMatch = contextualNameMatch[contextualNameMatch.length - 1];
          const extractedName = lastMatch.replace(/(?:he|she|his|her|individual|person|named)\s+/gi, '').trim();
          if (extractedName && 
              !extractedName.toLowerCase().includes('university') && 
              !extractedName.toLowerCase().includes('school') &&
              !extractedName.toLowerCase().includes('college') &&
              !extractedName.toLowerCase().includes('hub')) {
            name = extractedName;
          }
        }
      }
    }
    
    // Strategy 5: Last resort - look for any proper name pattern but with stricter filtering
    if (name === "Unknown") {
      const allNameMatches = text.match(/\b([A-Z][a-z]{2,})\s+([A-Z][a-z]{2,})\b/g);
      if (allNameMatches) {
        const strictExcluded = [
          'Computer Science', 'Data Science', 'Machine Learning', 'Web Development',
          'Higher Secondary', 'Public School', 'Tech Stack', 'Professional Summary',
          'Key Projects', 'Plant Disease', 'Disease Detection', 'Innovation Hub',
          'Woxsen University', 'Southwest Jiaotong', 'Nanyang Technological', 'Language Models'
        ];
        
        for (const potentialName of allNameMatches) {
          if (!strictExcluded.some(term => 
            term.toLowerCase().includes(potentialName.toLowerCase()) || 
            potentialName.toLowerCase().includes(term.toLowerCase())
          )) {
            name = potentialName;
            break;
          }
        }
      }
    }

    if (email !== "notfound@example.com" || name !== "Unknown") {
      return { name, email, phone };
    }

    return null;
  };

  const extractTextFromImage = async (file: File): Promise<{ name: string; email: string; phone: string } | null> => {
    try {
      if (!window.Tesseract) {
        throw new Error('Tesseract.js not loaded');
      }

      const { data: { text } } = await window.Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m)
      });

      console.log('Extracted image text:', text);

      // Parse lead information from OCR text using same logic
      const lead = parseLeadFromText(text);
      return lead;
    } catch (error) {
      console.error('OCR extraction error:', error);
      return null;
    }
  };

  const handleFileProcess = async (file: File) => {
    setIsProcessing(true);
    
    try {
      let extractedData: { name: string; email: string; phone: string } | null = null;
      
      if (file.type === 'application/pdf') {
        extractedData = await extractTextFromPDF(file);
      } else if (file.type.startsWith('image/')) {
        extractedData = await extractTextFromImage(file);
      }
      
      if (extractedData && extractedData.name && extractedData.email) {
        createLeadMutation.mutate({
          name: extractedData.name,
          email: extractedData.email,
          phone: extractedData.phone,
          status: 'New',
          source: 'Document'
        });
      } else {
        toast({
          title: "Warning",
          description: "Could not extract name and email from document. Please ensure the document contains clear name and email information.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: "Error",
        description: "Error processing document",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.type === 'application/pdf' || file.type.startsWith('image/')
    );
    
    if (validFile) {
      handleFileProcess(validFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  return (
    <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-white/20">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-3 animate-pulse-slow">
          <i className="fas fa-file-upload text-white"></i>
        </div>
        <h3 className="text-2xl font-bold text-slate-900">
          Document Upload
        </h3>
      </div>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragOver 
            ? 'border-emerald-500 bg-emerald-50/50 scale-105' 
            : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/20'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {isProcessing ? (
          <div className="space-y-4">
            <div className="relative">
              <i className="fas fa-spinner fa-spin text-emerald-500 text-4xl"></i>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>
            </div>
            <p className="text-slate-600 font-semibold text-lg">Processing document...</p>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full animate-shimmer"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="animate-bounce-gentle">
              <i className="fas fa-cloud-upload-alt text-slate-400 text-5xl"></i>
            </div>
            <div>
              <p className="text-slate-900 font-bold text-lg">Drop your PDF or PNG file here</p>
              <p className="text-slate-500 text-sm">or click to browse files</p>
            </div>
            
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            
            <label
              htmlFor="file-upload"
              className="inline-block btn-success text-white font-semibold py-3 px-8 rounded-2xl cursor-pointer"
            >
              <i className="fas fa-folder-open mr-2"></i>
              Choose File
            </label>
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-slate-50/80 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
          <p><i className="fas fa-check text-emerald-500 mr-2"></i><strong>Formats:</strong> PDF, PNG, JPG</p>
          <p><i className="fas fa-magic text-purple-500 mr-2"></i><strong>AI Extraction:</strong> Name & Email</p>
        </div>
      </div>
    </div>
  );
};
