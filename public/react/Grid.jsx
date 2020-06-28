export const Grid = styled.div`
  display: grid;

  grid-template-columns: ${({ columns }) => columns};
  grid-template-rows: ${({ rows }) => rows};

  grid-template-gap: ${({ spacing }) => spacing ?? 'auto'};

  width: ${({ width }) => width};
  height: ${({ height }) => height};

  min-width: ${({ minWidth }) => minWidth};
  min-height: ${({ minHeight }) => minHeight};

  max-width: ${({ maxWidth }) => maxWidth};
  max-height: ${({ maxHeight }) => maxHeight};

  padding: ${({ padding }) => padding};
`;
