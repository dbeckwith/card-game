export const Box = styled.div`
  display: flex;

  flex-direction: ${({ direction }) => ({ H: 'row', V: 'column' }[direction])};

  width: ${({ width }) => width ?? 'auto'};
  height: ${({ height }) => height ?? 'auto'};

  min-width: ${({ minWidth }) => minWidth ?? 'auto'};
  min-height: ${({ minHeight }) => minHeight ?? 'auto'};

  max-width: ${({ maxWidth }) => maxWidth ?? 'auto'};
  max-height: ${({ maxHeight }) => maxHeight ?? 'auto'};

  padding: ${({ padding }) => padding ?? 'auto'};

  flex-wrap: ${({ wrap }) => wrap ? 'wrap' : 'auto'};

  & > :not(:last-child) {
    margin-${({ direction }) => ({ H: 'right', V: 'bottom' }[direction])}: ${({ spacing }) => spacing ?? '4px'};
  }

  justify-content: ${({ direction, hAlign, vAlign }) => ({
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    stretch: 'space-between',
  }[{ H: hAlign, V: vAlign }[direction] ?? 'start'])};

  align-items: ${({ direction, hAlign, vAlign }) => ({
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    stretch: 'stretch',
  }[{ H: vAlign, V: hAlign }[direction] ?? 'start'])};
`;

export const HBox = (props) => (<Box {...props} direction="H" />);
export const VBox = (props) => (<Box {...props} direction="V" />);
