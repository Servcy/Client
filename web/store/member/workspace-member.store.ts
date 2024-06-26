import set from "lodash/set"
import sortBy from "lodash/sortBy"
import { action, computed, makeObservable, observable, runInAction } from "mobx"
import { computedFn } from "mobx-utils"

import { ERoles } from "@constants/iam"

import { WorkspaceService } from "@services/workspace.service"

import { IRouterStore } from "@store/application/router.store"
import { RootStore } from "@store/root.store"
import { IUserRootStore } from "@store/user"

import { IUserLite, IWorkspaceBulkInviteFormData, IWorkspaceMember, IWorkspaceMemberInvitation } from "@servcy/types"

import { IMemberRootStore } from "."

export interface IWorkspaceMembership {
    id: string
    member: string
    role: ERoles
    auto_approve_tracked_time: boolean
}

export interface IWorkspaceMemberStore {
    // observables
    workspaceMemberMap: Record<string, Record<string, IWorkspaceMembership>>
    workspaceMemberInvitations: Record<string, IWorkspaceMemberInvitation[]>
    // computed
    workspaceMemberIds: string[] | null
    workspaceMemberInvitationIds: string[] | null
    memberMap: Record<string, IWorkspaceMembership> | null
    totalWorkspaceMembers: number
    // computed actions
    getSearchedWorkspaceMemberIds: (searchQuery: string) => string[] | null
    getSearchedWorkspaceInvitationIds: (searchQuery: string) => string[] | null
    getWorkspaceMemberDetails: (workspaceMemberId: string) => IWorkspaceMember | null
    getWorkspaceInvitationDetails: (invitationId: string) => IWorkspaceMemberInvitation | null
    // fetch actions
    fetchWorkspaceMembers: (workspaceSlug: string) => Promise<IWorkspaceMember[]>
    fetchWorkspaceMemberInvitations: (workspaceSlug: string) => Promise<IWorkspaceMemberInvitation[]>
    // crud actions
    updateMember: (
        workspaceSlug: string,
        userId: string,
        data: { role: ERoles; auto_approve_tracked_time: boolean }
    ) => Promise<void>
    removeMemberFromWorkspace: (workspaceSlug: string, userId: string) => Promise<void>
    // invite actions
    inviteMembersToWorkspace: (workspaceSlug: string, data: IWorkspaceBulkInviteFormData) => Promise<void>
    updateMemberInvitation: (
        workspaceSlug: string,
        invitationId: string,
        data: Partial<IWorkspaceMemberInvitation>
    ) => Promise<void>
    deleteMemberInvitation: (workspaceSlug: string, invitationId: string) => Promise<void>
}

export class WorkspaceMemberStore implements IWorkspaceMemberStore {
    // observables
    workspaceMemberMap: {
        [workspaceSlug: string]: Record<string, IWorkspaceMembership>
    } = {} // { workspaceSlug: { userId: userDetails } }
    workspaceMemberInvitations: Record<string, IWorkspaceMemberInvitation[]> = {} // { workspaceSlug: [invitations] }
    // stores
    routerStore: IRouterStore
    userStore: IUserRootStore
    memberRoot: IMemberRootStore

    workspaceService

    constructor(_memberRoot: IMemberRootStore, _rootStore: RootStore) {
        makeObservable(this, {
            // observables
            workspaceMemberMap: observable,
            workspaceMemberInvitations: observable,
            // computed
            workspaceMemberIds: computed,
            workspaceMemberInvitationIds: computed,
            totalWorkspaceMembers: computed,
            memberMap: computed,
            // actions
            fetchWorkspaceMembers: action,
            updateMember: action,
            removeMemberFromWorkspace: action,
            fetchWorkspaceMemberInvitations: action,
            updateMemberInvitation: action,
            deleteMemberInvitation: action,
        })

        // root store
        this.routerStore = _rootStore.app.router
        this.userStore = _rootStore.user
        this.memberRoot = _memberRoot

        this.workspaceService = new WorkspaceService()
    }

    /**
     * @description get the list of all the user ids of all the members of the current workspace
     */
    get workspaceMemberIds() {
        const workspaceSlug = this.routerStore.workspaceSlug
        if (!workspaceSlug) return null
        const workspaceMembers = this.workspaceMemberMap?.[workspaceSlug]
        if (!workspaceMembers) return null
        let members = Object.values(workspaceMembers)
        members = sortBy(members, [
            (m) => {
                if (m && m.member) return m.member !== this.userStore.currentUser?.id
                return false
            },
            (m) => {
                if (m && m.member) return this.memberRoot?.memberMap?.[m.member]?.display_name?.toLowerCase()
                return false
            },
        ])
        const memberIds = members.map((m) => (m && m.member ? m.member : "")).filter((m) => m !== "")
        return memberIds.length > 0 ? memberIds : null
    }

    get memberMap() {
        const workspaceSlug = this.routerStore.workspaceSlug
        if (!workspaceSlug) return null
        return this.workspaceMemberMap?.[workspaceSlug] ?? {}
    }

    get totalWorkspaceMembers() {
        const workspaceSlug = this.routerStore.workspaceSlug
        if (!workspaceSlug) return 0
        return Object.keys(this.workspaceMemberMap?.[workspaceSlug] ?? {}).length
    }

    get workspaceMemberInvitationIds() {
        const workspaceSlug = this.routerStore.workspaceSlug
        if (!workspaceSlug) return null
        return this.workspaceMemberInvitations?.[workspaceSlug]?.map((inv) => inv.id) ?? []
    }

    /**
     * @description get the list of all the user ids that match the search query of all the members of the current workspace
     * @param searchQuery
     */
    getSearchedWorkspaceMemberIds = computedFn((searchQuery: string) => {
        const workspaceSlug = this.routerStore.workspaceSlug
        if (!workspaceSlug) return null
        const workspaceMemberIds = this.workspaceMemberIds
        if (!workspaceMemberIds) return null
        const searchedWorkspaceMemberIds = workspaceMemberIds?.filter((userId) => {
            const memberDetails = this.getWorkspaceMemberDetails(userId)
            if (!memberDetails) return false
            const memberSearchQuery = `${memberDetails.member.first_name} ${memberDetails.member.last_name} ${
                memberDetails.member.display_name
            } ${memberDetails.member.email ?? ""}`
            return memberSearchQuery.toLowerCase()?.includes(searchQuery.toLowerCase())
        })
        return searchedWorkspaceMemberIds
    })

    /**
     * @description get the list of all the invitation ids that match the search query of all the member invitations of the current workspace
     * @param searchQuery
     */
    getSearchedWorkspaceInvitationIds = computedFn((searchQuery: string) => {
        const workspaceSlug = this.routerStore.workspaceSlug
        if (!workspaceSlug) return null
        const workspaceMemberInvitationIds = this.workspaceMemberInvitationIds
        if (!workspaceMemberInvitationIds) return null
        const searchedWorkspaceMemberInvitationIds = workspaceMemberInvitationIds.filter((invitationId) => {
            const invitationDetails = this.getWorkspaceInvitationDetails(invitationId)
            if (!invitationDetails) return false
            const invitationSearchQuery = `${invitationDetails.email}`
            return invitationSearchQuery.toLowerCase()?.includes(searchQuery.toLowerCase())
        })
        return searchedWorkspaceMemberInvitationIds
    })

    /**
     * @description get the details of a workspace member
     * @param userId
     */
    getWorkspaceMemberDetails = computedFn((userId: string) => {
        const workspaceSlug = this.routerStore.workspaceSlug
        if (!workspaceSlug) return null
        const workspaceMember = this.workspaceMemberMap?.[workspaceSlug]?.[userId]
        if (!workspaceMember) return null

        const memberDetails: IWorkspaceMember = {
            id: workspaceMember.id,
            role: workspaceMember.role,
            member: this.memberRoot?.memberMap?.[workspaceMember.member] ?? ({} as IUserLite),
            auto_approve_tracked_time: workspaceMember.auto_approve_tracked_time,
        }
        return memberDetails
    })

    /**
     * @description get the details of a workspace member invitation
     * @param workspaceSlug
     * @param memberId
     */
    getWorkspaceInvitationDetails = computedFn((invitationId: string) => {
        const workspaceSlug = this.routerStore.workspaceSlug
        if (!workspaceSlug) return null
        const invitationsList = this.workspaceMemberInvitations?.[workspaceSlug]
        if (!invitationsList) return null

        const invitation = invitationsList.find((inv) => inv.id === invitationId)
        return invitation ?? null
    })

    /**
     * @description fetch all the members of a workspace
     * @param workspaceSlug
     */
    fetchWorkspaceMembers = async (workspaceSlug: string) =>
        await this.workspaceService.fetchWorkspaceMembers(workspaceSlug).then((response) => {
            runInAction(() => {
                response.forEach((member) => {
                    set(this.memberRoot?.memberMap, member.member.id, member.member)
                    set(this.workspaceMemberMap, [workspaceSlug, member.member.id], {
                        id: member.id,
                        member: member.member.id,
                        role: member.role,
                        auto_approve_tracked_time: member.auto_approve_tracked_time,
                    })
                })
            })
            return response
        })

    /**
     * @description update the role of a workspace member
     * @param workspaceSlug
     * @param userId
     * @param data
     */
    updateMember = async (
        workspaceSlug: string,
        userId: string,
        data: { role: ERoles; auto_approve_tracked_time: boolean }
    ) => {
        const memberDetails = this.getWorkspaceMemberDetails(userId)
        if (!memberDetails) throw new Error("Member not found")
        // original data to revert back in case of error
        const originalProjectMemberData = this.workspaceMemberMap?.[workspaceSlug]?.[userId]
        try {
            runInAction(() => {
                set(this.workspaceMemberMap, [workspaceSlug, userId, "role"], data.role)
                set(
                    this.workspaceMemberMap,
                    [workspaceSlug, userId, "auto_approve_tracked_time"],
                    data.auto_approve_tracked_time
                )
            })
            await this.workspaceService.updateWorkspaceMember(workspaceSlug, memberDetails.id, data)
        } catch (error) {
            // revert back to original members in case of error
            runInAction(() => {
                set(this.workspaceMemberMap, [workspaceSlug, userId], originalProjectMemberData)
            })
            throw error
        }
    }

    /**
     * @description remove a member from workspace
     * @param workspaceSlug
     * @param userId
     */
    removeMemberFromWorkspace = async (workspaceSlug: string, userId: string) => {
        const memberDetails = this.getWorkspaceMemberDetails(userId)
        if (!memberDetails) throw new Error("Member not found")
        await this.workspaceService.deleteWorkspaceMember(workspaceSlug, memberDetails?.id).then(() => {
            runInAction(() => {
                delete this.memberRoot?.memberMap?.[userId]
                delete this.workspaceMemberMap?.[workspaceSlug]?.[userId]
            })
        })
    }

    /**
     * @description fetch all the member invitations of a workspace
     * @param workspaceSlug
     */
    fetchWorkspaceMemberInvitations = async (workspaceSlug: string) =>
        await this.workspaceService.workspaceInvitations(workspaceSlug).then((response) => {
            runInAction(() => {
                set(this.workspaceMemberInvitations, workspaceSlug, response)
            })
            return response
        })

    /**
     * @description bulk invite members to a workspace
     * @param workspaceSlug
     * @param data
     */
    inviteMembersToWorkspace = async (workspaceSlug: string, data: IWorkspaceBulkInviteFormData) => {
        const response = await this.workspaceService.inviteWorkspace(workspaceSlug, data)
        await this.fetchWorkspaceMemberInvitations(workspaceSlug)
        return response
    }

    /**
     * @description update the role of a member invitation
     * @param workspaceSlug
     * @param invitationId
     * @param data
     */
    updateMemberInvitation = async (
        workspaceSlug: string,
        invitationId: string,
        data: Partial<IWorkspaceMemberInvitation>
    ) => {
        const originalMemberInvitations = [...(this.workspaceMemberInvitations?.[workspaceSlug] ?? [])] // in case of error, we will revert back to original members
        try {
            const memberInvitations = originalMemberInvitations?.map((invitation) => ({
                ...invitation,
                ...(invitation.id === invitationId && data),
            }))
            // optimistic update
            runInAction(() => {
                set(this.workspaceMemberInvitations, workspaceSlug, memberInvitations)
            })
            await this.workspaceService.updateWorkspaceInvitation(workspaceSlug, invitationId, data)
        } catch (error) {
            // revert back to original members in case of error
            runInAction(() => {
                set(this.workspaceMemberInvitations, workspaceSlug, originalMemberInvitations)
            })
            throw error
        }
    }

    /**
     * @description delete a member invitation
     * @param workspaceSlug
     * @param memberId
     */
    deleteMemberInvitation = async (workspaceSlug: string, invitationId: string) =>
        await this.workspaceService.deleteWorkspaceInvitations(workspaceSlug.toString(), invitationId).then(() => {
            runInAction(() => {
                this.workspaceMemberInvitations[workspaceSlug] =
                    this.workspaceMemberInvitations[workspaceSlug]?.filter((inv) => inv.id !== invitationId) ?? []
            })
        })
}
