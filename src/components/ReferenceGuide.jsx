import { useState, useRef, useEffect, useCallback } from "react";
import { referenceData } from "../data/referenceData.js";
import "./ReferenceGuide.css";

export default function ReferenceGuide() {
  const [query, setQuery]               = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeEntry, setActiveEntry]   = useState(null);
  const inputRef                        = useRef(null);
  const containerRef                    = useRef(null);

  const q = query.trim().toLowerCase();
  const results = q.length > 0
    ? referenceData.filter(e =>
        e.question.toLowerCase().includes(q) ||
        e.tags.some(t => t.includes(q))
      )
    : referenceData;

  // Close dropdown when clicking outside
  useEffect(() => {
    function onPointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Close modal on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        if (activeEntry) setActiveEntry(null);
        else setDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeEntry]);

  const openEntry = useCallback((entry) => {
    setActiveEntry(entry);
    setDropdownOpen(false);
    setQuery("");
  }, []);

  const closeModal = useCallback(() => setActiveEntry(null), []);

  return (
    <>
      {/* Search bar */}
      <div className="refguide" ref={containerRef}>
        <div className="refguide__search-row">
          <span className="refguide__search-icon">?</span>
          <input
            ref={inputRef}
            className="refguide__search"
            type="text"
            placeholder="Search: How do I…"
            value={query}
            onChange={e => { setQuery(e.target.value); setDropdownOpen(true); }}
            onFocus={() => setDropdownOpen(true)}
            aria-label="Search reference guide"
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
          />
          {query && (
            <button
              className="refguide__clear"
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Dropdown results */}
        {dropdownOpen && (
          <div className="refguide__dropdown" role="listbox">
            <div className="refguide__dropdown-header">
              {q.length > 0
                ? `${results.length} result${results.length !== 1 ? "s" : ""} for "${query.trim()}"`
                : `${results.length} topics — click to open`}
            </div>
            {results.length === 0 ? (
              <div className="refguide__empty">No results for &ldquo;{query.trim()}&rdquo;</div>
            ) : (
              <div className="refguide__dropdown-list">
                {results.map(entry => (
                  <button
                    key={entry.id}
                    className="refguide__item"
                    role="option"
                    onClick={() => openEntry(entry)}
                  >
                    <span className="refguide__item-q">{entry.question}</span>
                    {entry.answer.requirement === "full" && (
                      <span className="refguide__badge">Advanced UI</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal overlay */}
      {activeEntry && (
        <div
          className="refguide__overlay"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          role="dialog"
          aria-modal="true"
          aria-label={activeEntry.question}
        >
          <div className="refguide__modal">
            {/* Modal header */}
            <div className="refguide__modal-header">
              <h2 className="refguide__modal-title">{activeEntry.question}</h2>
              <button
                className="refguide__modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="refguide__modal-body">

              {/* Summary */}
              <p className="refguide__summary">{activeEntry.answer.summary}</p>

              {/* UI requirement badge */}
              <div className="refguide__meta-row">
                <span className="refguide__meta-label">UI MODE</span>
                <span className={`refguide__meta-value ${
                  activeEntry.answer.requirement === "full"
                    ? "refguide__meta-value--full"
                    : "refguide__meta-value--any"
                }`}>
                  {activeEntry.answer.requirement === "full" ? "Advanced UI required" : "Works in any UI mode"}
                </span>
              </div>

              {/* Button sequence */}
              {activeEntry.answer.steps?.length > 0 && (
                <section className="refguide__section">
                  <h3 className="refguide__section-title">Button Sequence</h3>
                  <div className="refguide__steps">
                    {activeEntry.answer.steps.map((step, i) => (
                      <div key={i} className="refguide__step">
                        {step.from && (
                          <span className="refguide__step-from">{step.from}</span>
                        )}
                        {step.input && !step.input.startsWith("(") && (
                          <code className="refguide__step-input">{step.input}</code>
                        )}
                        <span className="refguide__step-desc">{step.description}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Config menu items */}
              {activeEntry.answer.menuItems?.length > 0 && (
                <section className="refguide__section">
                  <h3 className="refguide__section-title">Config Menu Items</h3>
                  <div className="refguide__menu-items">
                    {activeEntry.answer.menuItems.map(item => (
                      <div key={item.number} className="refguide__menu-item">
                        <div className="refguide__menu-item-head">
                          <span className="refguide__menu-item-num">Item {item.number}</span>
                          <span className="refguide__menu-item-title">{item.title}</span>
                        </div>
                        <p className="refguide__menu-item-desc">{item.description}</p>
                        {item.detail && (
                          <p className="refguide__menu-item-detail">{item.detail}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Notes */}
              {activeEntry.answer.notes?.length > 0 && (
                <section className="refguide__section">
                  <h3 className="refguide__section-title">Notes</h3>
                  <ul className="refguide__notes">
                    {activeEntry.answer.notes.map((note, i) => (
                      <li key={i} className="refguide__note">{note}</li>
                    ))}
                  </ul>
                </section>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
