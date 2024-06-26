// icons
import { X } from "lucide-react"
import { observer } from "mobx-react-lite"

// constants
import { PROJECT_DISPLAY_FILTER_OPTIONS } from "@constants/project"

// types
import { TProjectAppliedDisplayFilterKeys } from "@servcy/types"

type Props = {
    handleRemove: (key: TProjectAppliedDisplayFilterKeys) => void
    values: TProjectAppliedDisplayFilterKeys[]
    editable: boolean | undefined
}

export const AppliedProjectDisplayFilters: React.FC<Props> = observer((props) => {
    const { handleRemove, values, editable } = props

    return (
        <>
            {values.map((key) => {
                const filterLabel = PROJECT_DISPLAY_FILTER_OPTIONS.find((s) => s.key === key)?.label
                return (
                    <div key={key} className="flex items-center gap-1 rounded p-1 text-xs bg-custom-background-80">
                        {filterLabel}
                        {editable && (
                            <button
                                type="button"
                                className="grid place-items-center text-custom-text-300 hover:text-custom-text-200"
                                onClick={() => handleRemove(key)}
                            >
                                <X size={10} strokeWidth={2} />
                            </button>
                        )}
                    </div>
                )
            })}
        </>
    )
})
