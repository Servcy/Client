import { useParams } from "next/navigation"

import size from "lodash/size"
import { observer } from "mobx-react-lite"
import { useTheme } from "next-themes"

import { EmptyState, getEmptyStateImagePath } from "@components/empty-state"

import { useApplication, useEventTracker, useIssues, useUser } from "@hooks/store"

import { EMPTY_FILTER_STATE_DETAILS, EMPTY_ISSUE_STATE_DETAILS } from "@constants/empty-state"
import { ERoles } from "@constants/iam"
import { EIssueFilterType, EIssuesStoreType } from "@constants/issue"

import { IIssueFilterOptions } from "@servcy/types"

interface EmptyStateProps {
    title: string
    image: string
    description?: string
    comicBox?: { title: string; description: string }
    primaryButton?: { text: string; icon?: React.ReactNode; onClick: () => void }
    secondaryButton?: { text: string; onClick: () => void }
    size?: "lg" | "sm" | undefined
    disabled?: boolean | undefined
}

export const ProjectEmptyState: React.FC = observer(() => {
    const { workspaceSlug, projectId } = useParams()
    // theme
    const { resolvedTheme } = useTheme()
    // store hooks
    const { commandPalette: commandPaletteStore } = useApplication()
    const { setTrackElement } = useEventTracker()
    const {
        membership: { currentProjectRole },
        currentUser,
    } = useUser()
    const { issuesFilter } = useIssues(EIssuesStoreType.PROJECT)

    const userFilters = issuesFilter?.issueFilters?.filters
    const activeLayout = issuesFilter?.issueFilters?.displayFilters?.layout

    const isLightMode = resolvedTheme ? resolvedTheme === "light" : currentUser?.theme.theme === "light"
    const currentLayoutEmptyStateImagePath = getEmptyStateImagePath(
        "empty-filters",
        activeLayout ?? "list",
        isLightMode
    )
    const EmptyStateImagePath = getEmptyStateImagePath("onboarding", "issues", isLightMode)

    const issueFilterCount = size(
        Object.fromEntries(
            Object.entries(userFilters ?? {}).filter(([, value]) => value && Array.isArray(value) && value.length > 0)
        )
    )

    const handleClearAllFilters = () => {
        if (!workspaceSlug || !projectId) return
        const newFilters: IIssueFilterOptions = {}
        Object.keys(userFilters ?? {}).forEach((key) => {
            newFilters[key as keyof IIssueFilterOptions] = []
        })
        issuesFilter.updateFilters(workspaceSlug.toString(), projectId.toString(), EIssueFilterType.FILTERS, {
            ...newFilters,
        })
    }

    const isEditingAllowed = currentProjectRole !== undefined && currentProjectRole >= ERoles.MEMBER

    const emptyStateProps: EmptyStateProps =
        issueFilterCount > 0
            ? {
                  title: EMPTY_FILTER_STATE_DETAILS["project"].title,
                  image: currentLayoutEmptyStateImagePath,
                  secondaryButton: {
                      text: EMPTY_FILTER_STATE_DETAILS["project"].secondaryButton.text,
                      onClick: handleClearAllFilters,
                  },
              }
            : {
                  title: EMPTY_ISSUE_STATE_DETAILS["project"].title,
                  description: EMPTY_ISSUE_STATE_DETAILS["project"].description,
                  image: EmptyStateImagePath,
                  comicBox: {
                      title: EMPTY_ISSUE_STATE_DETAILS["project"].comicBox.title,
                      description: EMPTY_ISSUE_STATE_DETAILS["project"].comicBox.description,
                  },
                  primaryButton: {
                      text: EMPTY_ISSUE_STATE_DETAILS["project"].primaryButton.text,
                      onClick: () => {
                          setTrackElement("Project issue empty state")
                          commandPaletteStore.toggleCreateIssueModal(true, EIssuesStoreType.PROJECT)
                      },
                  },
                  size: "lg",
                  disabled: !isEditingAllowed,
              }

    return (
        <div className="relative h-full w-full overflow-y-auto">
            <EmptyState {...emptyStateProps} />
        </div>
    )
})
