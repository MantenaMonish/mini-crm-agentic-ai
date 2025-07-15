import { users, leads, workflows, type User, type InsertUser, type Lead, type InsertLead, type Workflow, type InsertWorkflow } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lead management
  getAllLeads(): Promise<Lead[]>;
  getLeadById(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  
  // Workflow management
  getAllWorkflows(): Promise<Workflow[]>;
  getWorkflowById(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leads: Map<number, Lead>;
  private workflows: Map<number, Workflow>;
  private currentUserId: number;
  private currentLeadId: number;
  private currentWorkflowId: number;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.workflows = new Map();
    this.currentUserId = 1;
    this.currentLeadId = 1;
    this.currentWorkflowId = 1;

    // Add some initial leads for demonstration
    this.createLead({
      name: "John Smith",
      email: "john.smith@company.com",
      phone: "+1 (555) 123-4567",
      status: "New",
      source: "Manual"
    });

    this.createLead({
      name: "Sarah Johnson",
      email: "sarah.j@startup.io",
      phone: "+1 (555) 987-6543",
      status: "Contacted",
      source: "Document"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getLeadById(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const lead: Lead = { 
      id,
      name: insertLead.name,
      email: insertLead.email,
      phone: insertLead.phone || "N/A",
      status: insertLead.status || "New",
      source: insertLead.source || "Manual",
      createdAt: new Date()
    };
    this.leads.set(id, lead);
    return lead;
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const existingLead = this.leads.get(id);
    if (!existingLead) return undefined;

    const updatedLead: Lead = { ...existingLead, ...updates };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async deleteLead(id: number): Promise<boolean> {
    return this.leads.delete(id);
  }

  async getAllWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getWorkflowById(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.currentWorkflowId++;
    const workflow: Workflow = { 
      ...insertWorkflow, 
      id, 
      createdAt: new Date()
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const existingWorkflow = this.workflows.get(id);
    if (!existingWorkflow) return undefined;

    const updatedWorkflow: Workflow = { ...existingWorkflow, ...updates };
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }
}

export const storage = new MemStorage();
