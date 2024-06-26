import { useParams, useSearchParams } from "next/navigation"

import { FC, ReactNode, useEffect, useState } from "react"

import { observer } from "mobx-react-lite"
import { useTheme } from "next-themes"

import { useApplication, useUser } from "@hooks/store"

import { applyTheme, unsetCustomCssVariables } from "@helpers/theme.helper"

interface IStoreWrapper {
    children: ReactNode
}

const StoreWrapper: FC<IStoreWrapper> = observer((props) => {
    const { children } = props
    // states
    const [dom, setDom] = useState<any>()

    const params = useParams()
    const searchParams = useSearchParams()
    // store hooks
    const {
        theme: { sidebarCollapsed, toggleSidebar },
        router: { setQuery },
    } = useApplication()
    const { currentUser } = useUser()
    // theme
    const { setTheme } = useTheme()

    /**
     * Sidebar collapsed fetching from local storage
     */
    useEffect(() => {
        const localValue = localStorage && localStorage.getItem("app_sidebar_collapsed")
        const localBoolValue = localValue ? (localValue === "true" ? true : false) : false
        if (localValue && sidebarCollapsed === undefined) toggleSidebar(localBoolValue)
    }, [sidebarCollapsed, currentUser, setTheme, toggleSidebar])

    /**
     * Setting up the theme of the user by fetching it from local storage
     */
    useEffect(() => {
        if (!currentUser) return
        if (window) setDom(window.document?.querySelector<HTMLElement>("[data-theme='custom']"))
        setTheme(currentUser?.theme?.theme || "system")
        if (currentUser?.theme?.theme === "custom" && dom) applyTheme(currentUser?.theme?.palette, false)
        else unsetCustomCssVariables()
    }, [currentUser, setTheme, dom])

    useEffect(() => {
        if (!params) return
        setQuery({
            ...Object.fromEntries(searchParams),
            ...params,
        })
    }, [params, setQuery])

    return <>{children}</>
})

export default StoreWrapper
