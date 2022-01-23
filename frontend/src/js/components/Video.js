import React, { useEffect } from "react";

export default function Video({ stream }) {
  const localVideo = React.createRef();

  // localVideo.current is null on first render
  // localVideo.current.srcObject = stream;

  useEffect(() => {
    // Let's update the srcObject only after the ref has been set
    // and then every time the stream prop updates
    if (localVideo.current) localVideo.current.srcObject = stream;
  }, [stream, localVideo]);

  return (
    <div className="video-container">
      <video style={{ height: 100, width: 100 }} ref={localVideo} autoPlay muted/>
      <p>{stream.id}</p>
    </div>
  );
}
