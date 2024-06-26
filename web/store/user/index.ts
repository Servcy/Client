import { action, makeObservable, observable, runInAction } from "mobx"

import { AuthService } from "@services/auth.service"
import { UserService } from "@services/user.service"

// interfaces
import { IUser, IUserSettings } from "@servcy/types"

// store
import { RootStore } from "../root.store"
import { IUserMembershipStore, UserMembershipStore } from "./user-membership.store"

export interface IUserRootStore {
    // states
    currentUserError: any | null
    currentUserLoader: boolean
    // observables
    currentUser: IUser | null
    currentUserSettings: IUserSettings | null
    dashboardInfo: any
    // fetch actions
    fetchCurrentUser: () => Promise<IUser>
    fetchCurrentUserSettings: () => Promise<IUserSettings>
    fetchUserDashboardInfo: (workspaceSlug: string, month: number) => Promise<any>
    // crud actions
    updateUserOnBoard: () => Promise<void>
    updateTourCompleted: () => Promise<void>
    updateCurrentUser: (data: Partial<IUser>) => Promise<IUser>
    updateCurrentUserTheme: (theme: string) => Promise<IUser>

    deactivateAccount: () => Promise<void>
    logOut: () => Promise<void>

    membership: IUserMembershipStore
}

export class UserRootStore implements IUserRootStore {
    // states
    currentUserError: any | null = null
    currentUserLoader: boolean = false
    // observables
    currentUser: IUser | null = null
    currentUserSettings: IUserSettings | null = null

    dashboardInfo: any = null
    membership: UserMembershipStore

    // root store
    rootStore

    userService
    authService

    constructor(_rootStore: RootStore) {
        makeObservable(this, {
            // states
            currentUserError: observable.ref,
            currentUserLoader: observable.ref,
            // observable
            currentUser: observable,
            currentUserSettings: observable,
            dashboardInfo: observable,
            // action
            fetchCurrentUser: action,
            fetchCurrentUserSettings: action,
            fetchUserDashboardInfo: action,
            updateUserOnBoard: action,
            updateTourCompleted: action,
            updateCurrentUser: action,
            updateCurrentUserTheme: action,
            deactivateAccount: action,
            logOut: action,
        })
        this.rootStore = _rootStore
        this.userService = new UserService()
        this.authService = new AuthService()
        this.membership = new UserMembershipStore(_rootStore)
    }

    /**
     * Fetches the current user
     * @returns Promise<IUser>
     */
    fetchCurrentUser = async () => {
        try {
            this.currentUserLoader = true
            const response = await this.userService.currentUser()
            runInAction(() => {
                this.currentUser = response
                this.currentUserError = null
                this.currentUserLoader = false
            })
            // @ts-ignore
            if (window.FreshworksWidget)
                // @ts-ignore
                window.FreshworksWidget("identify", "ticketForm", {
                    name: response.display_name,
                    email: response.email,
                })
            return response
        } catch (error) {
            runInAction(() => {
                this.currentUserLoader = false
                this.currentUserError = error
            })
            throw error
        }
    }

    /**
     * Fetches the current user settings
     * @returns Promise<IUserSettings>
     */
    fetchCurrentUserSettings = async () =>
        await this.userService.currentUserSettings().then((response) => {
            runInAction(() => {
                this.currentUserSettings = response
            })
            return response
        })

    /**
     * Fetches the current user dashboard info
     * @returns Promise<IUserWorkspaceDashboard>
     */
    fetchUserDashboardInfo = async (workspaceSlug: string, month: number) => {
        try {
            const response = await this.userService.userWorkspaceDashboard(workspaceSlug, month)
            runInAction(() => {
                this.dashboardInfo = response
            })
            return response
        } catch (error) {
            throw error
        }
    }

    /**
     * Updates the user onboarding status
     * @returns Promise<void>
     */
    updateUserOnBoard = async () => {
        try {
            runInAction(() => {
                this.currentUser = {
                    ...this.currentUser,
                    is_onboarded: true,
                } as IUser
            })
            const user = this.currentUser ?? undefined
            if (!user) return
            await this.userService.updateUserOnBoard()
        } catch (error) {
            this.fetchCurrentUser()
            throw error
        }
    }

    /**
     * Updates the user tour completed status
     * @returns Promise<void>
     */
    updateTourCompleted = async () => {
        try {
            if (this.currentUser) {
                runInAction(() => {
                    this.currentUser = {
                        ...this.currentUser,
                        is_tour_completed: true,
                    } as IUser
                })
                const response = await this.userService.updateUserTourCompleted()
                return response
            }
        } catch (error) {
            this.fetchCurrentUser()
            throw error
        }
    }

    /**
     * Updates the current user
     * @param data
     * @returns Promise<IUser>
     */
    updateCurrentUser = async (data: Partial<IUser>) => {
        try {
            runInAction(() => {
                this.currentUser = {
                    ...this.currentUser,
                    ...data,
                } as IUser
            })
            const response = await this.userService.updateUser(data)
            runInAction(() => {
                this.currentUser = response
            })
            return response
        } catch (error) {
            this.fetchCurrentUser()
            throw error
        }
    }

    /**
     * Updates the current user theme
     * @param theme
     * @returns Promise<IUser>
     */
    updateCurrentUserTheme = async (theme: string) => {
        try {
            runInAction(() => {
                this.currentUser = {
                    ...this.currentUser,
                    theme: {
                        ...this.currentUser?.theme,
                        theme,
                    },
                } as IUser
            })
            const response = await this.userService.updateUser({
                theme: { ...this.currentUser?.theme, theme },
            } as IUser)
            return response
        } catch (error) {
            throw error
        }
    }

    /**
     * Deactivates the current user
     * @returns Promise<void>
     */
    deactivateAccount = async () =>
        await this.userService.deactivateAccount().then(() => {
            runInAction(() => {
                this.currentUser = null
                this.currentUserError = null
            })
            this.membership = new UserMembershipStore(this.rootStore)
            this.rootStore.eventTracker.resetSession()
            this.rootStore.resetOnSignout()
        })

    /**
     * Signs out the current user
     * @returns Promise<void>
     */
    logOut = async () =>
        await this.authService.logOut().then(() => {
            runInAction(() => {
                this.currentUser = null
            })
            this.membership = new UserMembershipStore(this.rootStore)
            this.rootStore.eventTracker.resetSession()
            this.rootStore.resetOnSignout()
        })
}
