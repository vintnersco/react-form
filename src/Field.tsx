import { stringify } from "querystring";
import React, { ComponentType, createElement, ReactElement, useEffect, useState } from "react";
import { FieldController } from "./controller/FieldController";
import { useForm } from "./Form";
import { FieldComponentProps, IOption } from "./controller/FormController";

interface FieldProps {
    name: string;
    isRequired?: boolean;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    component?: ComponentType<FieldComponentProps>;
    visibility?: (controller: FieldController) => boolean;
    id?: string;
    label?: string | ReactElement;
    help?: string | ReactElement;
    placeholder?: string;
    autoComplete?: string;
}
export function Field({ name, visibility, isRequired, component, ...others }: FieldProps) {
    const field = useFieldAndWatch(name);
    const controller = field.controller;

    if (visibility && !visibility(controller)) {
        return null;
    }

    const options = field.options;
    const label = others.label || field.label;
    const help = others.help || field.help;
    const placeholder = others.placeholder || field.placeholder;
    const autoComplete = others.autoComplete || field.autoComplete;

    controller.required = (isRequired ? `${label || name} is required` : false);
    const actualComponent = component || field.component;

    if (!actualComponent) {
        throw new Error(`No component specified for field ${name}`);
    }

    if (options && typeof options === 'function') {
        const loadOptions = options as (() => Promise<IOption[]>);
        return FieldWithAsyncOptions({ controller, name, isRequired, label, component: actualComponent, loadOptions, ...others })
    } else {
        return createElement(actualComponent, {
            name,
            label,
            help,
            placeholder,
            autoComplete,
            isRequired,
            onChange: controller.onChange,
            onBlur: controller.onBlur,
            value: controller.value,
            error: controller.error ? controller.form.translateError(controller.error) : null,
            options: options as { value: string, label: string }[],
            ...others
        });
    }
}
interface FieldWithAsyncOptionsProps extends Omit<FieldProps, 'visibility'> {
    controller: FieldController;
    loadOptions: () => Promise<IOption[]>
}

function FieldWithAsyncOptions({ controller, name, isRequired, label, component, loadOptions, ...others }: FieldWithAsyncOptionsProps) {
    const [options, setOptions] = useState<IOption[]>([]);
    useEffect(() => {
        loadOptions().then(setOptions);
    }, [loadOptions]);

    return createElement(component!, {
        name,
        label,
        isRequired,
        onChange: controller.onChange,
        onBlur: controller.onBlur,
        value: controller.value,
        error: controller.error ? controller.form.translateError(controller.error) : null,
        options: options as { value: string, label: string }[],
        ...others
    });
}

export function useField(name: string) {
    const form = useForm();
    return form.getField(name);
}

export function useFieldAndWatch(name: string) {
    const [change, setChangeNum] = useState<any>(null);
    const form = useForm();
    const field = form.getField(name);
    useEffect(() => {
        return field.controller.watch(() => {
            setChangeNum(new Object());
        })
    }, [field.controller])

    return field;
}
