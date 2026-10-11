import React, { useEffect } from 'react';
import styled from 'styled-components';

const StyledIns = styled.div`
  width: 320px;
  height: 50px;
  @media (min-width: 990px) {
    width: 728px;
    height: 90px;
  }
`;
function AdSpace(props) {
  const { currentPath } = props;
  useEffect(() => {}, []);
  return (
    <div>
      <StyledIns></StyledIns>
    </div>
  );
}
export default AdSpace;
