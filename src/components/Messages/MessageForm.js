import React from "react";
import firebase from "../../firebase";
import uuidv4 from "uuid/v4";
import { Segment, Button, Input } from "semantic-ui-react";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

class MessageForm extends React.Component {
  state = {
    storageRef: firebase.storage().ref(),
    uploadTask: null,
    uploadState: "",
    percentUploaded: 0,
    message: "",
    channel: this.props.channel,
    user: this.props.user,
    loading: false,
    errors: [],
    modal: false
  };

  toggleModal = () => this.setState({ modal: !this.state.modal });

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  createMessage = (fileUrl = null) => {
    const { user } = this.state;
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL
      }
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }

    return message;
  };

  sendMessage = () => {
    const { messagesRef } = this.props;
    const { message, channel, errors } = this.state;

    if (message) {
      this.setState({ loading: true });
      messagesRef
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({
            loading: false,
            message: "",
            errors: []
          });
        })
        .catch(err => {
          console.error(err);
          this.setState({
            loading: false,
            errors: errors.concat(err)
          });
        });
    } else {
      this.setState({ errors: errors.concat({ message: "Add a message" }) });
    }
  };

  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id;
    const ref = this.props.messagesRef;
    const filePath = `chat/public/${uuidv4()}.jpeg`;

    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          err => {
            console.error(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(downloadUrl => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
              })
              .catch(err => {
                console.error(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: "done" });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err)
        });
      });
  };

  render() {
    const {
      message,
      errors,
      loading,
      modal,
      percentUploaded,
      uploadState
    } = this.state;
    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          value={message}
          onChange={this.handleChange}
          style={{ marginBottom: "0.7em" }}
          label={<Button icon={"add"} />}
          labelPosition="left"
          placeholder="Write your message"
          className={
            errors.some(error => error.message.includes("message"))
              ? "error"
              : ""
          }
        />
        <Button.Group icon widths="2">
          <Button
            color="orange"
            onClick={this.sendMessage}
            disabled={loading}
            content="Add reply"
            labelPosition="left"
            icon="edit"
          />
          <Button
            color="teal"
            onClick={this.toggleModal}
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
        <FileModal
          modal={modal}
          toggleModal={this.toggleModal}
          uploadFile={this.uploadFile}
        />
        <ProgressBar uploadState={uploadState} percent={percentUploaded} />
      </Segment>
    );
  }
}

export default MessageForm;
