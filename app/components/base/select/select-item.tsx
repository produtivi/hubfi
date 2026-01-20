"use client";

import { isValidElement, useContext } from "react";
import { Check } from "@untitledui/icons";
import type { ListBoxItemProps as AriaListBoxItemProps } from "react-aria-components";
import { ListBoxItem as AriaListBoxItem, Text as AriaText } from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import { cx } from "@/lib/utils/cx";
import { isReactComponent } from "@/lib/utils/is-react-component";
import type { SelectItemType } from "./select";
import { SelectContext } from "./select";

const sizes = {
    sm: "p-2 pr-2.5",
    md: "p-2.5 pl-2",
};

interface SelectItemProps extends Omit<AriaListBoxItemProps<SelectItemType>, "id">, SelectItemType {}

export const SelectItem = ({ label, id, value, avatarUrl, supportingText, isDisabled, icon: Icon, className, children, ...props }: SelectItemProps) => {
    const { size } = useContext(SelectContext);

    const labelOrChildren = label || (typeof children === "string" ? children : "");
    const textValue = supportingText ? labelOrChildren + " " + supportingText : labelOrChildren;

    return (
        <AriaListBoxItem
            id={id}
            value={
                value ?? {
                    id,
                    label: labelOrChildren,
                    avatarUrl,
                    supportingText,
                    isDisabled,
                    icon: Icon,
                }
            }
            textValue={textValue}
            isDisabled={isDisabled}
            {...props}
            className={(state) => cx("w-full px-1.5 py-px outline-hidden", typeof className === "function" ? className(state) : className)}
        >
            {(state) => (
                <div
                    className={cx(
                        "flex cursor-pointer items-center gap-2 rounded-md outline-hidden select-none",
                        state.isSelected && "bg-accent",
                        state.isDisabled && "cursor-not-allowed",
                        state.isFocused && "bg-accent",
                        state.isFocusVisible && "ring-2 ring-primary ring-inset",

                        // Icon styles
                        "*:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:text-muted-foreground",
                        state.isDisabled && "*:data-icon:text-muted-foreground/50",

                        sizes[size],
                    )}
                >
                    {avatarUrl ? (
                        <Avatar aria-hidden="true" size="xs" src={avatarUrl} alt={label} />
                    ) : isReactComponent(Icon) ? (
                        <Icon data-icon aria-hidden="true" />
                    ) : isValidElement(Icon) ? (
                        Icon
                    ) : null}

                    <div className="flex w-full min-w-0 flex-1 flex-wrap gap-x-2">
                        <AriaText
                            slot="label"
                            className={cx("truncate text-md font-medium whitespace-nowrap text-foreground", state.isDisabled && "text-muted-foreground/50")}
                        >
                            {label || (typeof children === "function" ? children(state) : children)}
                        </AriaText>

                        {supportingText && (
                            <AriaText slot="description" className={cx("text-md whitespace-nowrap text-muted-foreground", state.isDisabled && "text-muted-foreground/50")}>
                                {supportingText}
                            </AriaText>
                        )}
                    </div>

                    {state.isSelected && (
                        <Check
                            aria-hidden="true"
                            className={cx(
                                "ml-auto text-primary",
                                size === "sm" ? "size-4 stroke-[2.5px]" : "size-5",
                                state.isDisabled && "text-muted-foreground/50",
                            )}
                        />
                    )}
                </div>
            )}
        </AriaListBoxItem>
    );
};
