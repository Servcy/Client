import React from "react"

import { observer } from "mobx-react-lite"

import { FilterHeader, FilterOption } from "@components/issues"

type TFilterBillableType = {
    is_billable: boolean | undefined
    handleUpdate: (val?: boolean) => void
}

export const FilterBillableType: React.FC<TFilterBillableType> = observer((props) => {
    const { is_billable, handleUpdate } = props

    const [previewEnabled, setPreviewEnabled] = React.useState(true)

    return (
        <>
            <FilterHeader
                title="Billable Status"
                isPreviewEnabled={previewEnabled}
                handleIsPreviewEnabled={() => setPreviewEnabled(!previewEnabled)}
            />
            {previewEnabled && (
                <div>
                    <FilterOption
                        isChecked={is_billable === undefined ? true : false}
                        onClick={() => handleUpdate(undefined)}
                        title={"All"}
                        multiple={false}
                    />
                    <FilterOption
                        isChecked={is_billable === true ? true : false}
                        onClick={() => handleUpdate(true)}
                        title={"Billable"}
                        multiple={false}
                    />
                    <FilterOption
                        isChecked={is_billable === false ? true : false}
                        onClick={() => handleUpdate(false)}
                        title={"Non-Billable"}
                        multiple={false}
                    />
                </div>
            )}
        </>
    )
})
