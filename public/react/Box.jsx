export const Box = styled.div`
  display: flex;

  flex-direction: ${({ direction }) => ({ H: 'row', V: 'column' }[direction])};

  width: ${({ width }) => width ?? 'auto'};
  height: ${({ height }) => height ?? 'auto'};

  padding: ${({ padding }) => padding ?? 'auto'};

  & > :not(:last-child) {
    margin-${({ direction }) => ({ H: 'right', V: 'bottom' }[direction])}: ${({ spacing }) => spacing ?? '4px'};
  }

  justify-content: ${({ direction, hAlign, vAlign }) => ({
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    stretch: 'space-between',
  }[{ H: hAlign, V: vAlign }[direction]])};

  align-items: ${({ direction, hAlign, vAlign }) => ({
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    stretch: 'stretch',
  }[{ H: vAlign, V: hAlign }[direction]])};
`;

export const HBox = (props) => (<Box {...props} direction="H" />);
export const VBox = (props) => (<Box {...props} direction="V" />);
