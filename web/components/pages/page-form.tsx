import { Controller, useForm } from "react-hook-form"

import { ProjectDropdown } from "@components/dropdowns"

import { PAGE_ACCESS_SPECIFIERS } from "@constants/page"

import { IPageStore } from "@store/page.store"

import { IPage } from "@servcy/types"
import { Button, Input, Tooltip } from "@servcy/ui"

type Props = {
    handleFormSubmit: (values: IPage) => Promise<void>
    handleClose: () => void
    pageStore?: IPageStore
    projectId?: string
    setActiveProject: React.Dispatch<React.SetStateAction<string | null>>
}

const defaultValues = {
    name: "",
    description: "",
    access: 0,
}

export const PageForm: React.FC<Props> = (props) => {
    const { handleFormSubmit, handleClose, setActiveProject, projectId, pageStore } = props

    const {
        formState: { errors, isSubmitting },
        handleSubmit,
        control,
    } = useForm<IPage>({
        defaultValues: pageStore
            ? { name: pageStore.name, description: pageStore.description, access: pageStore.access, project: projectId }
            : { ...defaultValues, project: projectId },
    })

    const handleCreateUpdatePage = (formData: IPage) => handleFormSubmit(formData)

    return (
        <form onSubmit={handleSubmit(handleCreateUpdatePage)}>
            <div className="space-y-4">
                <div className="flex items-center gap-x-3">
                    {!pageStore && (
                        <Controller
                            control={control}
                            name="project"
                            render={({ field: { value, onChange } }) => (
                                <div className="h-7">
                                    <ProjectDropdown
                                        value={value}
                                        onChange={(val: string) => {
                                            onChange(val)
                                            setActiveProject(val)
                                        }}
                                        buttonVariant="border-with-text"
                                        tabIndex={10}
                                    />
                                </div>
                            )}
                        />
                    )}
                    <h3 className="text-xl font-medium leading-6 text-custom-text-200">
                        {pageStore ? "Update" : "New"} Page
                    </h3>
                </div>
                <div className="space-y-3">
                    <div>
                        <Controller
                            control={control}
                            name="name"
                            rules={{
                                required: "Title is required",
                                maxLength: {
                                    value: 255,
                                    message: "Title should be less than 255 characters",
                                },
                            }}
                            render={({ field: { value, onChange, ref } }) => (
                                <Input
                                    id="name"
                                    type="text"
                                    value={value}
                                    onChange={onChange}
                                    ref={ref}
                                    hasError={Boolean(errors.name)}
                                    placeholder="Title"
                                    className="w-full resize-none text-lg"
                                    tabIndex={1}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>
            <div className="mt-5 md:flex items-center justify-between gap-2">
                <Controller
                    control={control}
                    name="access"
                    render={({ field: { value, onChange } }) => (
                        <div className="flex items-center gap-2">
                            <div className="flex flex-shrink-0 items-stretch gap-0.5 rounded border-[0.5px] border-custom-border-200 p-1">
                                {PAGE_ACCESS_SPECIFIERS.map((access, index) => (
                                    <Tooltip key={access.key} tooltipContent={access.label}>
                                        <button
                                            type="button"
                                            onClick={() => onChange(access.key)}
                                            className={`grid aspect-square place-items-center rounded-sm p-1 hover:bg-custom-background-90 ${
                                                value === access.key ? "bg-custom-background-90" : ""
                                            }`}
                                            tabIndex={2 + index}
                                        >
                                            <access.icon
                                                className={`h-3.5 w-3.5 ${
                                                    value === access.key
                                                        ? "text-custom-text-100"
                                                        : "text-custom-text-400"
                                                }`}
                                                strokeWidth={2}
                                            />
                                        </button>
                                    </Tooltip>
                                ))}
                            </div>
                            <h6 className="text-xs font-medium">
                                {PAGE_ACCESS_SPECIFIERS.find((access) => access.key === value)?.label}
                            </h6>
                        </div>
                    )}
                />
                <div className="flex items-center gap-2 justify-end mt-5 md:mt-0">
                    <Button variant="neutral-primary" size="sm" onClick={handleClose} tabIndex={4}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit" loading={isSubmitting} tabIndex={5}>
                        {pageStore
                            ? isSubmitting
                                ? "Updating..."
                                : "Update page"
                            : isSubmitting
                              ? "Creating..."
                              : "Create Page"}
                    </Button>
                </div>
            </div>
        </form>
    )
}
