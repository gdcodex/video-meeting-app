import React, { Component } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
import { v4 as uuidv4 } from "uuid";

//components
import Video from "./components/Video";

export default class VideoLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomId: this.joinExistingRoom() ? this.props.match.params.uuid : uuidv4(),
      videoData: [],
    };
  }
  joinExistingRoom() {
    return (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.uuid
    );
  }
  socketConnection() {
    this.socket = io("http://localhost:5000");
    // client-side
    this.socket.on("connect", () => {
      console.log("socket_id", this.socket.id);
    });
    this.myPeer = new Peer({
      host: "peerjs-server.herokuapp.com",
      secure: true,
      port: 443,
    });
    this.peers = {};
    console.log("my_peer", this.myPeer);
    console.log("my_socket", this.socket);
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        this.streamId = stream.id;
        this.addVideoStream(stream);
        console.log("id_stream", stream.id);
        //make calls
        this.myPeer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (userVideoStream) => {
            this.addVideoStream(userVideoStream);
          });
        });
        //receive calls
        this.socket.on("user-connected", (userId) => {
          console.log("userId: ", userId);
          this.connectToNewUser(userId, stream);
        });
      });

    this.socket.on("user-disconnected", (userId, streamId) => {
      console.log("user-disconnected", this.peers[userId], streamId);
      let resultVideoData = this.state.videoData.filter(
        (i) => i.id !== streamId
      );
      this.setState({
        videoData: resultVideoData,
      });
      if (this.peers[userId]) {
        this.peers[userId].close();
      }
    });

    this.myPeer.on("open", (id) => {
      this.socket.emit("join-room", this.state.roomId, id, this.streamId);
    });
  }
  connectToNewUser(userId, stream) {
    const call = this.myPeer.call(userId, stream);
    let exitVideo = '';
    call.on("stream", (userVideoStream) => {
      exitVideo = userVideoStream;
      this.addVideoStream(userVideoStream);
    });
    call.on("close", () => {
      console.log("exit-stream", exitVideo.id);
      // let resultVideoData = this.state.videoData.filter(
      //   (i) => i.id !== exitVideo.id
      // );
      // this.setState({
      //   videoData: resultVideoData,
      // });
    });

    this.peers[userId] = call;
  }

  addVideoStream(stream) {
    console.log("my_stream", stream);
    this.setState((prevState) => ({
      videoData: [...new Set([...prevState.videoData, stream])],
    }));
  }

  componentDidMount() {
    if (!this.joinExistingRoom()) {
      this.props.history.push(`/${this.state.roomId}`);
    }
    this.socketConnection();
    // const socket = io("http://localhost:5000");
    // socket.on("connect", () => {
    //   console.log(socket.id); // x8WIv7-mJelg7on_ALbx
    // });
  }

  render() {
    const { videoData } = this.state;
    return (
      <div className="stream-div">
        {videoData &&
          videoData.length &&
          videoData.map((stream, i) => <Video key={i} stream={stream} />)}
          <p className="videoItem">Top Parent</p>
      </div>
    );
  }
}
