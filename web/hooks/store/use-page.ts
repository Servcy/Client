import { useContext } from "react"

// mobx store
import { StoreContext } from "@contexts/StoreContext"

export const usePage = (pageId: string) => {
    const context = useContext(StoreContext)
    if (context === undefined) throw new Error("usePage must be used within StoreProvider")

    const { projectPageMap, projectArchivedPageMap } = context.projectPages

    const { projectId, workspaceSlug } = context.app.router
    if (!projectId || !workspaceSlug) {
        return
    }

    if (projectPageMap[projectId] && projectPageMap[projectId][pageId]) return projectPageMap[projectId][pageId]
    else if (projectArchivedPageMap[projectId] && projectArchivedPageMap[projectId][pageId])
        return projectArchivedPageMap[projectId][pageId]
    else return
}
