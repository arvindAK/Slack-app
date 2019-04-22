import React from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";
import mime from "mime-types";

class FileModal extends React.Component {
  state = {
    file: null,
    authorized: ["image/jpeg", "image/png"]
  };

  addFile = event => {
    const file = event.target.files[0];
    if (file) {
      this.setState({ file });
    }
  };

  sendFile = () => {
    const { file } = this.state;
    const { uploadFile, toggleModal } = this.props;

    if (file !== null) {
      if (this.isAuthorized(file.name)) {
        const metadata = { contentType: mime.lookup(file.name) };
        uploadFile(file, metadata);
        toggleModal();
      }
    }
  };

  isAuthorized = fileName =>
    this.state.authorized.includes(mime.lookup(fileName));

  clearFile = () => this.setState({ file: null });

  render() {
    const { modal, toggleModal } = this.props;

    return (
      <Modal basic open={modal} onClose={toggleModal}>
        <Modal.Header>Select an Image File</Modal.Header>
        <Modal.Content>
          <Input
            onChange={this.addFile}
            fluid
            label="File types: jpg, png"
            name="file"
            type="file"
          />
        </Modal.Content>
        <Modal.Actions>
          <Button color="green" inverted onClick={this.sendFile}>
            <Icon name="checkmark" /> Send
          </Button>
          <Button color="red" inverted onClick={toggleModal}>
            <Icon name="remove" /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default FileModal;