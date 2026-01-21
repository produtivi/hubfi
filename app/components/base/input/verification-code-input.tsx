'use client';

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface VerificationCodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  isError?: boolean;
  autoFocus?: boolean;
}

export function VerificationCodeInput({
  length = 6,
  value,
  onChange,
  isDisabled = false,
  isError = false,
  autoFocus = true
}: VerificationCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Preenche os valores em cada input
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return; // Só aceita números

    const newDigits = [...digits];
    newDigits[index] = digit.slice(-1); // Pega só o último dígito

    const newValue = newDigits.join('');
    onChange(newValue);

    // Move para o próximo input se digitou algo
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Se o campo atual está vazio, volta pro anterior
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      } else {
        // Limpa o campo atual
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pastedData);

    // Foca no último input preenchido ou no próximo vazio
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          disabled={isDisabled}
          className={`
            w-12 h-14 text-center text-2xl font-semibold
            rounded-lg border-2 bg-background text-foreground
            transition-all duration-200
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isError
              ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
              : focusedIndex === index
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border hover:border-muted-foreground'
            }
          `}
        />
      ))}
    </div>
  );
}
