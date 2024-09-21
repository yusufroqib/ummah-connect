import React, { useEffect, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getUser } from "../../redux/feature/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import useRedirectLoggedOutUser from "../UseRedirect/UseRedirectLoggedOutUser";
import Sidebar from "../Sidebar/Sidebar";
import { HiOutlineViewGridAdd } from "react-icons/hi";
import PageLoader from "../Loader/PageLoader";

const URL = import.meta.env.VITE_APP_BACKEND_URL;

const ForumList = ({ userId }) => {
  useRedirectLoggedOutUser("/login");

  const [threads, setThreads] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const initialState = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    photo: user?.photo || "",
    role: user?.role || "",
  };

  const [profile, setProfile] = useState(initialState);

  useEffect(() => {
    dispatch(getUser(userId));
  }, [dispatch, userId]);

  useLayoutEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        photo: user.photo,
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await axios.get(`${URL}/discussion/all-threads`);
        setThreads(response.data);
        // console.log(response.data)
        setLoading(false);
      } catch (error) {
        console.error("Error fetching threads:", error);
        setLoading(false);
      }
    };

    fetchThreads();
  }, []);

  const filteredData = threads.filter((thread) =>
    thread.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <PageLoader />
      </div>
    );
  }
  if (!threads) return <p>Threads not found</p>;

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        profile={profile}
        user={user}
      />

      <div
        className={`w-full bg-white p-4 flex justify-center ${
          isSidebarOpen ? "md:ml-1/4" : ""
        }`}
      >
        <div className="flex flex-col items-left  w-full md:w-5/6 p-4">
          <div className="p-4">
            <div className="flex items-left justify-between flex-col md:flex-row md:items-center">
              <h1 className="font-bold text-3xl">Forum Overview</h1>

              {/* <AdminLink> */}
              <button className="bg-blue-800 rounded-full py-2 px-4 text-white w-[120px] md:w-[160px] flex items-center justify-center ">
                <Link to="/create-thread" className="flex items-center gap-2">
                  <HiOutlineViewGridAdd size={20} />
                  Create New
                </Link>
              </button>
              {/* </AdminLink> */}
            </div>
            <div className="border my-4 rounded-lg">
              <input
                type="search"
                name=""
                id=""
                className="border w-[100%] p-2"
                placeholder="Search for specific threads or topics"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="p-2 md:p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.length > 0 ? (
                filteredData.map((thread) => (
                  <Link
                    to={`/threads/${thread._id}`}
                    className="w-full bg-white p-4 border rounded-lg cursor-pointer"
                  >
                    <p className="mt-4 text-2xl font-bold">{thread.title}</p>
                    <p className="mt-4">
                      {thread.content.length > 150
                        ? `${thread.content.substring(0, 150)}...`
                        : thread.content}
                    </p>
                    <div className="border-y mt-2 flex items-left justify-between flex-col md:flex-row md:items-center">
                      <p className=" py-2 mt-2">
                        Author: {thread.createdBy.username}{" "}
                      </p>
                      <p className=" py-2 mt-2">
                        Created: {formatDate(thread.createdAt)}{" "}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p>Oops! No threads found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumList;
