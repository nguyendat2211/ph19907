import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useEffect } from "react";
import { useState } from "react";
import Feather from "react-native-vector-icons/Feather";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionic from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
const API_BASE_URL = "http://192.168.1.10:3000";

const Item = (props) => {
  const postPersonImage = require("../../assets/profile-icon.png");
  const [cmt, setCmt] = useState([]);
  const [comment, setcomment] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isLike, setisLike] = useState(false);
  const [likes, setlikes] = useState([]);
  const [likeId, setlikeId] = useState();
  const [curLike, setcurLike] = useState();
  const [isfollow, setisfollow] = useState(false);
  const [follow, setfollow] = useState([]);
  const [followId, setFollowId] = useState();
  const [curFollow, setCurFollow] = useState();
  const isFocused = useIsFocused();
  const [showEditOptions, setShowEditOptions] = useState(false);
  const [editPost, setEditPost] = useState("");
  const [selectImage, setSelectImage] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Hàm để hiển thị/nấp đi nút ba chấm
  const toggleEditOptions = (itemId) => {
    setShowEditOptions(!showEditOptions);
    setSelectedItemId(itemId);
  };
  // Image
  const pickImage = async () => {
    try {
      const image = await ImagePicker.launchImageLibraryAsync({
        width: 300,
        height: 400,
        cropping: true,
        includeBase64: true,
      });
      if (!image.canceled) {
        let _uri = image.assets[0].uri;
        let file_ext = _uri.substring(_uri.lastIndexOf(".") + 1);

        FileSystem.readAsStringAsync(image.assets[0].uri, {
          encoding: "base64",
        }).then((res) => {
          setSelectImage("data:image/" + file_ext + ";base64," + res);
        });
      } else {
        console.log("Image picker was canceled.");
      }
    } catch (error) {
      console.log("Error selecting image:", error);
    }
  };
  //Update post
  const updatePostById = async () => {
    try {
      const urlPost = API_BASE_URL + "/posts/" + selectedItemId;

      const updatedPost = {
        postContent: editPost,
        postImage: selectImage,
        profileName: props.inputData.profileName,
      };

      const response = await axios.put(urlPost, updatedPost);

      if (response.status === 200) {
        Alert.alert("Thông báo!", "Bài viết đã được cập nhật!");
        setEditPost("");
        setSelectImage("");
        setShowEditOptions(false);
        loadData();
      } else {
        Alert.alert("Cập nhật không thành công!");
        console.log(response.status);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
    }
  };
  //Delete Post
  const DeleteById = async () => {
    try {
      const urlPost = API_BASE_URL + "/posts/" + selectedItemId;
      const response = await axios.delete(urlPost);

      if (response.status === 200) {
        Alert.alert("Thông báo!", "Delete success");
        setShowEditOptions(false);
        loadData();
      } else {
        Alert.alert("Delete failed!");
        console.log(response.status);
      }
    } catch (error) {
      console.error("Lỗi: ", error);
    }
  };
  useEffect(() => {
    loadData();
  }, [isFocused]);

  //get list comments
  const getComments = async () => {
    try {
      const response = await axios.get(
        "http://192.168.1.10:3000/comments?postId=" +
          props.inputData.id +
          "&expand=users"
      );
      setCmt(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  //comments
  const addNewCmt = async () => {
    if (comment !== "") {
      let newComment = {
        postId: props.inputData.id,
        profileId: props.userInfo.fullname,
        commentContent: comment,
      };
      try {
        let urlComment = API_BASE_URL + "/comments";
        const response = await axios.post(urlComment, newComment);

        if (response.status === 201) {
          Alert.alert("Thông báo!", "Đã thêm bình luận!");
          setcomment("");
          loadData();
        } else {
          Alert.alert("Thêm không thành công!");
          console.log(response.status);
        }
      } catch (error) {
        console.error("Lỗi khi đăng bình luận:", error);
      }
    }
  };
  // Thả tim
  const postLikes = async (postId, profileId) => {
    let newLikes = {
      postId: postId,
      profileId: profileId,
    };
    try {
      let urlLikes = API_BASE_URL + "/likes";
      await axios.post(urlLikes, newLikes);
      loadData();
      console.log("Đã like 1 " + props.userInfo.fullname);
    } catch (error) {
      console.log("like bi loi" + error);
    }
  };
  // Bỏ thả tym
  const disLikes = async (likeId) => {
    try {
      // Kiểm tra xem likeId có tồn tại và không phải null/undefined
      if (!likeId) {
        console.log("likeId không hợp lệ!");
        return;
      }

      let urlLike = API_BASE_URL + "/likes/" + likeId;
      const response = await axios.delete(urlLike);

      if (response.status === 200) {
        // Xoá thành công
        console.log("Xoá like thành công");
        setisLike(false); // Cập nhật trạng thái isLike
        loadData(); // Load lại dữ liệu
      } else {
        console.log("Xoá like không thành công");
      }
    } catch (error) {
      console.log("dislike bi loi " + error);
    }
  };

  // Trạng thái like
  const getIsLike = () => {
    likes.forEach((element) => {
      if (element.profileId == props.userInfo.id) {
        setlikeId(element.id);
      }
      if (element.id == curLike) {
        setisLike(false);
      }
    });
  };
  // xem đã like hay chưa
  const getLike = async () => {
    try {
      let urlLike = API_BASE_URL + "/likes?postId=" + props.inputData.id;
      const response = await axios.get(urlLike);
      setlikes(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFollow = async () => {
    try {
      const urlFollow = API_BASE_URL + "/follow";

      const followData = {
        userId: props.inputData.id,
        followerId: props.userInfo.id,
        username: props.userInfo.fullname,
      };
      await axios.post(urlFollow, followData);
      setisfollow(true);
      getIsFollow();
    } catch (error) {
      console.error("Error following/unfollowing:", error);
    }
  };

  const getIsFollow = () => {
    follow.forEach((element) => {
      if (element.followerId == props.userInfo.id) {
        setFollowId(element.id);
      }
      if (element.id == curFollow) {
        setisLike(false);
      }
    });
  };
  // xem đã like hay chưa
  const getFollow = async () => {
    try {
      let urlLike = API_BASE_URL + "/follow?userId=" + props.inputData.id;
      const response = await axios.get(urlLike);
      setfollow(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadData = () => {
    getComments();
    getLike();
    getIsLike();
    getIsFollow();
    getFollow();
  };
  return (
    <View>
      <View
        style={{
          paddingBottom: 10,
          borderBottomColor: "gray",
          borderBottomWidth: 0.1,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 15,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* ẢNH ĐẠI DIỆN */}
            <Image
              source={postPersonImage}
              style={{ width: 40, height: 40, borderRadius: 100 }}
            />
            {/* TÊN NGƯỜI POST */}
            <View style={{ paddingLeft: 5 }}>
              <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                {props.inputData.profileName}
              </Text>
            </View>
          </View>
          {/* NÚT FOLLOW */}

          <View>
            {props.userInfo.role === 0 && !isfollow ? (
              <TouchableOpacity onPress={handleFollow}>
                <Feather
                  name="user-plus"
                  style={{
                    paddingRight: 10,
                    fontSize: 20,
                    color: "black",
                  }}
                />
              </TouchableOpacity>
            ) : props.userInfo.role === 1 ? (
              <TouchableOpacity
                onPress={() => {
                  toggleEditOptions(props.inputData.id);
                }}
              >
                <Feather
                  name="more-vertical"
                  style={{ fontSize: 20, color: "black" }}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={showEditOptions}
            onRequestClose={() => setShowEditOptions(!showEditOptions)}
          >
            <View style={styles.centeredView}>
              <View style={styles.editModal}>
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      color: "black",
                      fontSize: 15,
                      fontWeight: "bold",
                    }}
                  >
                    Update new posts
                  </Text>
                </View>
                <TextInput
                  style={{
                    borderRadius: 20,
                    marginTop: 20,
                    marginBottom: 20,
                    padding: 15,
                    borderWidth: 1,
                    borderColor: "gray",
                  }}
                  placeholder="Nội dung bài viết mới"
                  onChangeText={setEditPost}
                />

                {/* Icon ảnh */}
                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity onPress={pickImage}>
                    {selectImage != "" ? (
                      <View>
                        <Image
                          source={{ uri: selectImage }}
                          style={{ width: 300, height: 180 }}
                        />
                      </View>
                    ) : (
                      <View>
                        <Feather
                          name={"camera"}
                          style={{
                            fontSize: 100,
                            width: 100,
                            height: 100,
                          }}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={{ alignItems: "center", marginTop: 20 }}>
                  {/* Nút cập nhật */}
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      style={{
                        borderWidth: 1,
                        backgroundColor: "black",
                        borderRadius: 15,
                        marginTop: 10,
                      }}
                      onPress={updatePostById}
                    >
                      <Text
                        style={{
                          padding: 8,
                          color: "white",
                          fontSize: 14,
                          justifyContent: "center",
                        }}
                      >
                        Update
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        borderWidth: 1,
                        backgroundColor: "black",
                        borderRadius: 15,
                        marginTop: 10,
                        marginLeft: 20,
                      }}
                      onPress={DeleteById}
                    >
                      <Text
                        style={{
                          padding: 8,
                          color: "white",
                          fontSize: 14,
                          justifyContent: "center",
                        }}
                      >
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/* Nút đóng */}
                  <TouchableOpacity onPress={() => setShowEditOptions(false)}>
                    <Text
                      style={{ color: "blue", paddingTop: 10, fontSize: 14 }}
                    >
                      Đóng
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* Hết nút edit */}
        </View>
        {/* HIỂN THỊ ẢNH ĐÃ ĐĂNG */}
        <View
          style={{
            position: "relative",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: props.inputData.postImage }}
            style={{ width: "100%", height: 250 }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 15,
          }}
        >
          {/* NÚT THẢ TYM VÀ COMMENT */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {isLike ? (
              <TouchableOpacity
                onPress={() => {
                  disLikes(likeId);
                  setisLike(false);
                }}
              >
                <AntDesign
                  name="heart"
                  style={{
                    paddingRight: 10,
                    fontSize: 20,
                    color: isLike ? "red" : "black",
                  }}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  postLikes(props.inputData.id, props.userInfo.id);
                  setisLike(true);
                }}
              >
                <AntDesign
                  name="hearto"
                  style={{
                    paddingRight: 10,
                    fontSize: 20,
                    color: isLike ? "red" : "black",
                  }}
                />
              </TouchableOpacity>
            )}

            {/* Nut comment */}
            <TouchableOpacity
              onPress={() => [setModalVisible(true), getComments]}
            >
              <Ionic
                name="chatbox-outline"
                style={{ fontSize: 20, paddingRight: 10 }}
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Feather name="share-2" style={{ fontSize: 20 }} />
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={{ fontWeight: "bold", fontSize: 20 }}>Comments</Text>
              <ScrollView>
                {cmt.map((item) => (
                  <View
                    key={item.id}
                    style={{ flexDirection: "row", marginTop: 30 }}
                  >
                    <View style={{ marginRight: 10 }}>
                      <Image source={postPersonImage}></Image>
                    </View>
                    <View>
                      <Text style={{ fontWeight: "bold" }}>
                        {item.profileId}
                      </Text>
                      <Text>{item.commentContent}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: "red", paddingTop: 10, fontSize: 14 }}>
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* PHẦN NỘI DUNG BÀI POST */}
        <View style={{ paddingHorizontal: 15 }}>
          <Text
            style={{
              fontWeight: "700",
              fontSize: 14,
              paddingVertical: 2,
            }}
          >
            {props.inputData.postContent}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          ></View>
          {/* TEXT INPUT COMMENT */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View
              key={comment.id}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Image
                source={postPersonImage}
                style={{
                  width: 25,
                  height: 25,
                  borderRadius: 100,
                  backgroundColor: "white",
                  marginRight: 10,
                }}
              />
              <TextInput
                placeholder="Add a comment "
                onChangeText={setcomment}
              />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={addNewCmt}>
                <Feather
                  name="send"
                  style={{ fontSize: 20, marginRight: 15 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Item;

const styles = StyleSheet.create({
  centeredView: {
    alignItems: "flex-end",
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  modalView: {
    marginBottom: 60,
    height: "50%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    width: 300,
  },
  editModal: {
    marginBottom: 60,
    height: "55%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    width: 350,
  },
});
