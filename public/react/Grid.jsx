export const Grid = styled.div`
  display: grid;

  grid-template-columns: ${({ columns }) => columns};
  grid-template-rows: ${({ rows }) => rows};

  grid-template-gap: ${({ spacing }) => spacing ?? 'auto'};
`;
