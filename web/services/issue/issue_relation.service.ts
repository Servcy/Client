import { API_BASE_URL } from "@helpers/common.helper";
// services
import { APIService } from "@services/api.service";
// types
import type { TIssue, TIssueRelation, TIssueRelationTypes } from "@servcy/types";

export class IssueRelationService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async listIssueRelations(workspaceSlug: string, projectId: string, issueId: string): Promise<TIssueRelation> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/issue-relation/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createIssueRelations(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: { relation_type: TIssueRelationTypes; issues: string[] }
  ): Promise<TIssue[]> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/issue-relation/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteIssueRelation(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: { relation_type: TIssueRelationTypes; related_issue: string }
  ): Promise<any> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/remove-relation/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
