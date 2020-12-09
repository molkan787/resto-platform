/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'strapi-helper-plugin';

const UpgradePlanModal = ({ isOpen, onToggle }) => {

  return (
    <Modal isOpen={isOpen} onToggle={onToggle} closeButtonColor="#fff">
      <h1>Error Code: UPM_Admin</h1>
    </Modal>
  );
};

UpgradePlanModal.defaultProps = {
  isOpen: false,
  onToggle: () => {},
};

UpgradePlanModal.propTypes = {
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
};

export default UpgradePlanModal;
