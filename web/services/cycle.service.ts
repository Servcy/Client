import { APIService } from "@services/api.service"

import { API_BASE_URL } from "@helpers/common.helper"

import type { CycleDateCheckData, ICycle, TIssue } from "@servcy/types"

export class CycleService extends APIService {
    constructor() {
        super(API_BASE_URL)
    }

    async getWorkspaceCycles(workspaceSlug: string): Promise<ICycle[]> {
        return this.get(`/project/${workspaceSlug}/cycles/`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async workspaceActiveCycles(workspaceSlug: string): Promise<{
        [projectId: string]: ICycle[]
    }> {
        return this.get(`/project/${workspaceSlug}/active-cycles/`)
            .then((res) => res?.data)
            .catch((err) => {
                throw err?.response?.data
            })
    }

    async createCycle(workspaceSlug: string, projectId: string, data: any): Promise<ICycle> {
        return this.post(`/project/${workspaceSlug}/${projectId}/cycles/`, data)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async getCyclesWithParams(workspaceSlug: string, projectId: string, cycleType?: "current"): Promise<ICycle[]> {
        return this.get(`/project/${workspaceSlug}/${projectId}/cycles/`, {
            params: {
                cycle_view: cycleType,
            },
        })
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async getCycleDetails(workspaceSlug: string, projectId: string, cycleId: string): Promise<ICycle> {
        return this.get(`/project/${workspaceSlug}/${projectId}/cycles/${cycleId}/`)
            .then((res) => res?.data)
            .catch((err) => {
                throw err?.response?.data
            })
    }

    async getCycleIssues(workspaceSlug: string, projectId: string, cycleId: string): Promise<TIssue[]> {
        return this.get(`/project/${workspaceSlug}/${projectId}/cycles/${cycleId}/cycle-issues/`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async getCycleIssuesWithParams(
        workspaceSlug: string,
        projectId: string,
        cycleId: string,
        queries?: any
    ): Promise<TIssue[]> {
        return this.get(`/project/${workspaceSlug}/${projectId}/cycles/${cycleId}/cycle-issues/`, {
            params: queries,
        })
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async patchCycle(workspaceSlug: string, projectId: string, cycleId: string, data: Partial<ICycle>): Promise<any> {
        return this.patch(`/project/${workspaceSlug}/${projectId}/cycles/${cycleId}/`, data)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async deleteCycle(workspaceSlug: string, projectId: string, cycleId: string): Promise<any> {
        return this.delete(`/project/${workspaceSlug}/${projectId}/cycles/${cycleId}/`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async cycleDateCheck(workspaceSlug: string, projectId: string, data: CycleDateCheckData): Promise<any> {
        return this.post(`/project/${workspaceSlug}/${projectId}/cycles/date-check/`, data)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async addCycleToFavorites(
        workspaceSlug: string,
        projectId: string,
        data: {
            cycle: string
        }
    ): Promise<any> {
        return this.post(`/project/${workspaceSlug}/${projectId}/user-favorite-cycles/`, data)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async transferIssues(
        workspaceSlug: string,
        projectId: string,
        cycleId: string,
        data: {
            new_cycle_id: string
        }
    ): Promise<any> {
        return this.post(`/project/${workspaceSlug}/${projectId}/cycles/${cycleId}/transfer-issues/`, data)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }

    async removeCycleFromFavorites(workspaceSlug: string, projectId: string, cycleId: string): Promise<any> {
        return this.delete(`/project/${workspaceSlug}/${projectId}/user-favorite-cycles/${cycleId}/`)
            .then((response) => response?.data)
            .catch((error) => {
                throw error?.response?.data
            })
    }
}
