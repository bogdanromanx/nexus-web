import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import ReactPlayer from 'react-player';
import * as moment from 'moment';
import { Collapse, Modal, Button, List } from 'antd';

import '../styles/video-plugin.less';

const { Panel } = Collapse;

type VideoProps = {
  orgLabel: string;
  projectLabel: string;
  resource: Resource;
};

type VideoObject = {
  name: string;
  description: string;
  thumbnailUrl: [];
  uploadDate: Date;
  duration: string;
  embedUrl: string;
};

const VideoPluginContainer: React.FunctionComponent<VideoProps> = ({
  resource,
  orgLabel,
  projectLabel,
}) => {
  const nexus = useNexusContext();
  const [videoData, setVideoData] = React.useState<any>();
  const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = React.useState<any>();

  const handleOk = () => {
    const isModalVisible = false;
    setIsModalVisible(isModalVisible);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedVideo(null);
  };

  React.useEffect(() => {
    loadVideo();
  }, []);

  const handleSelectedVideo = (video: any) => {
    const selectedVideo = video;
    setSelectedVideo(selectedVideo);
    setIsModalVisible(true);
  };
  const loadVideo = async () => {
    const videoResource = (await nexus.Resource.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(resource['@id'])
    )) as Resource<{
      video: VideoObject[];
    }>;

    const videoData = videoResource.video
      ? ([videoResource.video].flat() as VideoObject[])
      : undefined;

    setVideoData(videoData);
  };

  if (!videoData) return null;
  return (
    <Collapse onChange={() => {}}>
      {videoData[0] && videoData[0].embedUrl ? (
        <Panel header="Video" key="1">
          <List
            itemLayout="horizontal"
            dataSource={videoData}
            renderItem={(item: any) => (
              <List.Item
                extra={
                  item.duration &&
                  item.uploadDate && (
                    <div>
                      <p>{moment.duration(item.duration).humanize()}</p>
                      <p>{moment(item.uploadDate).format('DD/MM/YYYY')}</p>
                    </div>
                  )
                }
              >
                <List.Item.Meta
                  avatar={<ReactPlayer url={item.embedUrl} light={true} />}
                  title={
                    <Button
                      type="link"
                      onClick={() => {
                        handleSelectedVideo(item);
                      }}
                    >
                      {item.name ? item.name : 'Video Name'}
                    </Button>
                  }
                  description={
                    item.description
                      ? item.description
                      : 'Description of video when information available'
                  }
                />
              </List.Item>
            )}
          />
          {selectedVideo && !!selectedVideo.name ? (
            <Modal
              title={selectedVideo.name}
              bodyStyle={{ padding: 0 }}
              visible={isModalVisible && !!selectedVideo}
              onOk={handleOk}
              onCancel={handleCancel}
              width={640}
              footer={null}
            >
              {!!selectedVideo.embedUrl ? (
                <ReactPlayer url={selectedVideo.embedUrl} />
              ) : null}
            </Modal>
          ) : null}
        </Panel>
      ) : null}
    </Collapse>
  );
};

export default VideoPluginContainer;
