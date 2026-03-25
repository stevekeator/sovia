"use client";

import { useEffect, useId, useRef, useState } from "react";

type PortalSelectOption = {
  description?: string;
  label: string;
  value: string;
};

export function PortalSelect({
  className,
  defaultValue = "",
  name,
  onValueChange,
  options,
  placeholder = "Select an option",
}: {
  className?: string;
  defaultValue?: string;
  name: string;
  onValueChange?: (value: string) => void;
  options: PortalSelectOption[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [activeIndex, setActiveIndex] = useState(() => {
    const selectedIndex = options.findIndex((option) => option.value === defaultValue);
    return selectedIndex >= 0 ? selectedIndex : 0;
  });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    setValue(defaultValue);
    const selectedIndex = options.findIndex((option) => option.value === defaultValue);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [defaultValue]);

  useEffect(() => {
    onValueChange?.(value);
  }, [onValueChange, value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, isOpen]);

  function openSelect(nextIndex?: number) {
    const selectedIndex = options.findIndex((option) => option.value === value);
    const fallbackIndex = selectedIndex >= 0 ? selectedIndex : 0;
    setActiveIndex(nextIndex ?? fallbackIndex);
    setIsOpen(true);
  }

  function closeSelect() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function commitSelection(index: number) {
    const option = options[index];
    if (!option) {
      return;
    }

    setValue(option.value);
    setActiveIndex(index);
    closeSelect();
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openSelect();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openSelect(options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isOpen) {
        closeSelect();
      } else {
        openSelect();
      }
    }
  }

  function handleOptionKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index + 1) % options.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index - 1 + options.length) % options.length);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commitSelection(index);
      return;
    }

    if (event.key === "Escape" || event.key === "Tab") {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSelect();
        return;
      }

      setIsOpen(false);
      return;
    }
  }

  return (
    <div ref={rootRef} className={["portal-select", className ?? ""].join(" ").trim()}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        ref={triggerRef}
        className="portal-select__trigger"
        onClick={() => {
          if (isOpen) {
            closeSelect();
          } else {
            openSelect();
          }
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={selectedOption ? "text-foreground" : "text-muted"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className={["portal-select__caret", isOpen ? "portal-select__caret--open" : ""].join(" ")}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M4.5 6.75L9 11.25L13.5 6.75"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {isOpen ? (
        <div id={listboxId} role="listbox" className="portal-select__panel">
          {options.map((option, index) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value || "__empty"}
                type="button"
                role="option"
                aria-selected={isSelected}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                className={[
                  "portal-select__option",
                  index === activeIndex ? "portal-select__option--active" : "",
                  isSelected ? "portal-select__option--selected" : "",
                ].join(" ")}
                onClick={() => commitSelection(index)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                tabIndex={index === activeIndex ? 0 : -1}
              >
                <span className="portal-select__option-label">{option.label}</span>
                {option.description ? (
                  <span className="portal-select__option-description">{option.description}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
