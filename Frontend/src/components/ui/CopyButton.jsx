import React, { useState } from 'react';
import { Copy, Check, ClipboardPaste } from 'lucide-react';

/**
 * Universal clipboard copy with robust fallback for older browsers / non-HTTPS.
 */
export async function copyToClipboard(text) {
  if (!text && text !== 0) return false;
  const str = String(text);

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(str);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard.writeText failed, falling back:', err);
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = str;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('execCommand copy fallback failed:', err);
    return false;
  }
}

/**
 * Modern 1-Click Copy Button with instant micro-animation feedback.
 */
export function CopyButton({
  text,
  label,
  copiedLabel = 'Copied!',
  size = 'xs',
  variant = 'ghost',
  className = '',
  title,
  onCopy,
  iconOnly = false
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      if (onCopy) onCopy(text);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeClasses = {
    xs: 'text-[11px] px-2 py-1 gap-1',
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3 py-2 gap-2'
  }[size] || 'text-[11px] px-2 py-1 gap-1';

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4'
  }[size] || 'w-3 h-3';

  const variantClasses = {
    ghost: copied
      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
      : 'text-gray-500 hover:text-[#F84464] hover:bg-[#F84464]/10 border border-transparent',
    outline: copied
      ? 'bg-emerald-50 text-emerald-600 border border-emerald-300'
      : 'bg-white text-gray-600 hover:text-[#F84464] border border-gray-200 hover:border-[#F84464]/40 shadow-2xs',
    badge: copied
      ? 'bg-emerald-500 text-white shadow-xs'
      : 'bg-gray-100 text-gray-700 hover:bg-[#F84464] hover:text-white transition-colors',
    minimal: copied
      ? 'text-emerald-600'
      : 'text-gray-400 hover:text-[#F84464]'
  }[variant] || '';

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title || (copied ? 'Copied to clipboard!' : `Copy "${text}"`)}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer select-none active:scale-95 ${sizeClasses} ${variantClasses} ${className}`}
    >
      {copied ? (
        <>
          <Check className={`${iconSizes} text-emerald-600 animate-in zoom-in-75 duration-150 shrink-0`} />
          {!iconOnly && (
            <span className="font-semibold text-emerald-600 text-[10px] animate-in fade-in duration-150">
              {copiedLabel}
            </span>
          )}
        </>
      ) : (
        <>
          <Copy className={`${iconSizes} shrink-0 transition-transform group-hover:scale-110`} />
          {!iconOnly && label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}

/**
 * Interactive 1-Click Monospace Code Badge with built-in copy.
 * Clicking anywhere on the badge copies the text and pulses green.
 */
export function CopyBadge({
  text,
  prefix,
  size = 'sm',
  variant = 'brand',
  className = '',
  onCopy
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      if (onCopy) onCopy(text);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const variants = {
    brand: copied
      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/25'
      : 'bg-[#F84464]/10 text-[#F84464] hover:bg-[#F84464] hover:text-white border-[#F84464]/20 hover:border-[#F84464]',
    neutral: copied
      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
      : 'bg-gray-100 text-gray-800 hover:bg-[#222432] hover:text-white border-gray-200',
    dark: copied
      ? 'bg-emerald-500 text-white border-emerald-500'
      : 'bg-[#222432] text-white hover:bg-[#F84464] border-gray-700'
  }[variant] || '';

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2'
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied to clipboard!' : `Click to copy "${text}"`}
      className={`group relative inline-flex items-center font-mono font-bold rounded-xl border transition-all duration-200 cursor-pointer select-none active:scale-95 shadow-2xs hover:shadow-xs ${sizeClasses} ${variants} ${className}`}
    >
      {prefix && <span className="opacity-60 font-sans text-[10px] font-medium mr-0.5">{prefix}</span>}
      <span className="tracking-tight">{text}</span>
      {copied ? (
        <span className="inline-flex items-center gap-0.5 bg-white/25 px-1 py-0.2 rounded text-[9px] font-sans font-black uppercase tracking-wider animate-in fade-in zoom-in-75">
          <Check className="w-2.5 h-2.5" /> Copied
        </span>
      ) : (
        <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all shrink-0" />
      )}
    </button>
  );
}

/**
 * 1-Click Paste Button to read from clipboard into an input.
 */
export function PasteButton({
  onPaste,
  size = 'sm',
  className = '',
  label = 'Paste'
}) {
  const [pasted, setPasted] = useState(false);

  const handlePaste = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && onPaste) {
          onPaste(text);
          setPasted(true);
          setTimeout(() => setPasted(false), 1500);
        }
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
      // Fallback: prompt
      const manual = window.prompt('Paste your code here:');
      if (manual && onPaste) {
        onPaste(manual);
      }
    }
  };

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-1 gap-1',
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3 py-2 gap-2'
  }[size] || 'text-xs px-2.5 py-1.5 gap-1.5';

  return (
    <button
      type="button"
      onClick={handlePaste}
      title="Paste from clipboard"
      className={`inline-flex items-center justify-center font-semibold rounded-xl bg-gray-700/70 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-600 transition cursor-pointer select-none active:scale-95 ${sizeClasses} ${className}`}
    >
      <ClipboardPaste className="w-3.5 h-3.5" />
      <span>{pasted ? 'Pasted!' : label}</span>
    </button>
  );
}

export default CopyButton;
