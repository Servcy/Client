import { useContext } from "react"

// mobx store
import { StoreContext } from "@contexts/StoreContext"

import { ILabelStore } from "@store/label.store"

export const useLabel = (): ILabelStore => {
    const context = useContext(StoreContext)
    if (context === undefined) throw new Error("useLabel must be used within StoreProvider")
    return context.label
}
