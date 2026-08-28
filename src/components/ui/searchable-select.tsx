"use client";

/**
 * Select-like combobox for long option lists (countries, timezones, currencies):
 * a trigger that looks like `SelectTrigger`, opening a popup with a search box
 * on top of the filtered list. Built on Base UI `Combobox`.
 */
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  className?: string;
}

export function SearchableSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  disabled,
  "aria-invalid": ariaInvalid,
  className,
}: SearchableSelectProps) {
  const t = useTranslations("common");
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <ComboboxPrimitive.Root
      items={options}
      value={selected}
      onValueChange={(next) => onValueChange(next?.value ?? "")}
      itemToStringLabel={(item: SearchableSelectOption) => item.label}
      itemToStringValue={(item: SearchableSelectOption) => item.value}
      isItemEqualToValue={(a: SearchableSelectOption, b: SearchableSelectOption) =>
        a.value === b.value
      }
      disabled={disabled}
    >
      <ComboboxPrimitive.Trigger
        id={id}
        aria-invalid={ariaInvalid}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:hover:bg-input/50",
          className
        )}
      >
        <span className={cn("line-clamp-1 flex-1 text-left", !selected && "text-muted-foreground")}>
          <ComboboxPrimitive.Value>{selected?.label ?? placeholder ?? ""}</ComboboxPrimitive.Value>
        </span>
        <ComboboxPrimitive.Icon
          render={<ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />}
        />
      </ComboboxPrimitive.Trigger>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner sideOffset={4} className="isolate z-50">
          <ComboboxPrimitive.Popup className="flex max-h-[min(20rem,var(--available-height))] w-(--anchor-width) min-w-56 origin-(--transform-origin) flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="flex items-center gap-2 border-b px-2.5">
              <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
              <ComboboxPrimitive.Input
                placeholder={searchPlaceholder ?? t("search")}
                className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <ComboboxPrimitive.Empty className="px-3 py-6 text-center text-sm text-muted-foreground empty:hidden">
              {t("noResults")}
            </ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List className="overflow-y-auto p-1 empty:hidden">
              {(item: SearchableSelectOption) => (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item}
                  className="relative flex cursor-default items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <span className="line-clamp-1">{item.label}</span>
                  <ComboboxPrimitive.ItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
                    <CheckIcon className="size-4" />
                  </ComboboxPrimitive.ItemIndicator>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}
