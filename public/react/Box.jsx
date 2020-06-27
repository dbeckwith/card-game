export const Box = styled.div`
  display: flex;

  flex-direction: ${({ direction }) => ({ H: 'row', V: 'column' }[direction])};

  width: ${({ width }) => width};
  height: ${({ height }) => height};

  min-width: ${({ minWidth }) => minWidth};
  min-height: ${({ minHeight }) => minHeight};

  max-width: ${({ maxWidth }) => maxWidth};
  max-height: ${({ maxHeight }) => maxHeight};

  padding: ${({ padding }) => padding};

  flex-wrap: ${({ wrap }) => wrap != null ? 'wrap' : undefined};
  align-content: ${({ wrap }) => wrap};

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
