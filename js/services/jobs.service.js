import { db } from '../db/database.js';
import { store } from '../state/store.js';

export const jobsService = {
    async loadJobs() {
        try {
            const jobs = await db.getAll('jobs');
            const clients = store.getState().clients;

            const populatedJobs = jobs.map(job => {
                const client = clients.find(c => c.id === job.clientId);
                return { ...job, client };
            });

            populatedJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            store.dispatch('JOBS_UPDATED', populatedJobs);
            return populatedJobs;
        } catch (error) {
            console.error('Error loading jobs:', error);
            throw error;
        }
    },

    async createJob(jobData) {
        if (!jobData.clientId || !jobData.status) {
            throw new Error('Faltan datos requeridos (cliente o estado)');
        }

        const newJob = await db.create('jobs', jobData);
        await this.loadJobs();
        return newJob;
    },

    async updateJob(id, jobData) {
        if (!id) throw new Error('ID requerido');

        const updatedJob = await db.update('jobs', id, jobData);
        await this.loadJobs();
        return updatedJob;
    },

    async deleteJob(id) {
        if (!id) throw new Error('ID requerido');

        await db.softDelete('jobs', id);
        await this.loadJobs();
    }
};
