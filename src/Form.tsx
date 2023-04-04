import { createContext, FormEvent, ReactElement, useContext, useEffect, useState } from "react";
import { FormController, FormWatcher, IFieldDescriptor } from "./controller/FormController";
import { IValidationError } from "./error";

const FormContext = createContext<FormController | null>(null);

interface FormProps {
    fields: Record<string, IFieldDescriptor>;
    onSubmit: (data: Record<string, any>, form: FormController) => void;
    data?: Record<string, any>;
    id?: string;
    noValidate?: boolean;
    autoComplete?: string;
    onChange?: FormWatcher;
    translateError?: (error: IValidationError) => string;
    children: ReactElement | ReactElement[];
}
export function Form({ fields, data, onSubmit, onChange, translateError, children, noValidate, ...others }: FormProps) {
    if (noValidate == null) {
        noValidate = true; // default is to not validate
    }
    const [form] = useState(() => {
        const form = new FormController({ fields, data, onSubmit, translateError });
        onChange && form.watch(onChange);
        return form;
    });
    const handleSubmit = (evt: FormEvent) => {
        evt.preventDefault();
        evt.stopPropagation();
        form.submit();
    }

    return (
        <FormContext.Provider value={form}>
            <form {...others} onSubmit={handleSubmit} noValidate={noValidate}>
                {children}
            </form>
        </FormContext.Provider>
    )
}

export function useForm() {
    const form = useContext(FormContext);
    if (!form) {
        throw new Error("useForm must be used within a Form");
    }
    return form;
}

export function useFormAndWatch() {
    const [change, setChangeNum] = useState<any>(null);
    const form = useForm();
    useEffect(() => {
        return form.watch(() => {
            setChangeNum(new Object());
        })
    }, [form])
    return form;
}
