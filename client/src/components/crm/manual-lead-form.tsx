import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertLead } from "@shared/schema";

export const ManualLeadForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return '';
    // Indian phone number validation: supports +91, 91, or direct 10-digit
    const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/[\s-]/g, '');
    
    if (cleanPhone.length < 10) return 'Phone number must be at least 10 digits';
    if (!phoneRegex.test(phone)) return 'Please enter a valid phone number (e.g., +91 9876543210 or 9876543210)';
    return '';
  };

  const validateName = (name: string): string => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) return 'Name can only contain letters and spaces';
    return '';
  };

  // Handle field changes with validation
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    let error = '';
    switch (field) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const createLeadMutation = useMutation({
    mutationFn: async (lead: InsertLead) => {
      const response = await apiRequest('POST', '/api/leads', lead);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      setFormData({ name: '', email: '', phone: '' });
      setErrors({ name: '', email: '', phone: '' });
      toast({
        title: "Success",
        description: "Lead added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add lead",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    
    setErrors({
      name: nameError,
      email: emailError,
      phone: phoneError
    });
    
    // Check if there are any validation errors
    if (nameError || emailError || phoneError) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive",
      });
      return;
    }
    
    createLeadMutation.mutate({
      ...formData,
      status: 'New',
      source: 'Manual'
    });
  };

  return (
    <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-white/20">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 animate-pulse-slow">
          <i className="fas fa-user-plus text-white"></i>
        </div>
        <h3 className="text-2xl font-bold text-slate-900">
          Manual Lead Entry
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/80 ${
              errors.name 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-slate-200 focus:border-blue-500'
            }`}
            placeholder="Enter full name (e.g., John Smith)"
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.name}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/80 ${
              errors.email 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-slate-200 focus:border-blue-500'
            }`}
            placeholder="Enter email address (e.g., john@example.com)"
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.email}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/80 ${
              errors.phone 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-slate-200 focus:border-blue-500'
            }`}
            placeholder="Enter phone number (e.g., +91 9876543210 or 9876543210)"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.phone}
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={createLeadMutation.isPending || !!errors.name || !!errors.email || !!errors.phone || !formData.name || !formData.email}
          className="w-full btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl text-lg transition-all duration-300"
        >
          <i className="fas fa-plus mr-2"></i>
          {createLeadMutation.isPending ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Adding...
            </>
          ) : (
            'Add Lead'
          )}
        </button>
      </form>
    </div>
  );
};
