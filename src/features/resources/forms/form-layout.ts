import styled from 'styled-components'

export const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`

export const Fields = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};

  /*
    Native <select> renders ~2px taller than <input> with identical padding, so single-line
    controls are pinned to one height for a tidy column. App-level layout only — the design
    system's own styles are untouched. Textareas are excluded so they stay multi-line.
  */
  & input:not([type='checkbox']),
  & select {
    height: 44px;
  }

  /*
    The design system's checkbox visually hides the real <input>, leaving its 18px square not
    clickable — only the text label toggles it. Stretching the input over its (position:
    relative) wrapper makes the whole row, square included, a hit target. App-level layout
    only; opacity:0 from the design system keeps it invisible and the visual state intact.
  */
  & input[type='checkbox'] {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    cursor: pointer;
    /* The visual square is position:relative and would otherwise paint over this input,
       swallowing clicks; z-index lifts the (transparent) input above it. */
    z-index: 1;
  }
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`

// Errors the client cannot predict, such as the backend's uniqueness check.
export const ServerError = styled.p`
  margin: 0;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.warning};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.warning};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  font-size: 0.875rem;
`
