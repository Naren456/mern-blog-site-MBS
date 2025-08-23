import { Avatar, Button, Dropdown, Navbar, TextInput } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon, FaSun } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signoutSuccess } from "../redux/user/userSlice";
import { useEffect, useState } from "react";

export default function Header() {
  const path = useLocation().pathname;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(true);
 

  
  const handleProfileRedirect = () => {
    navigate("/dashboard?tab=profile");
  };
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  return (
    <Navbar className="border-b-2">
      <Link
        to="/"
        className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
      >
        <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
          Sahand's
        </span>
        Blog
      </Link>
      <form onSubmit={handleSubmit}>
        <TextInput
          type="text"
          placeholder="Search..."
          rightIcon={AiOutlineSearch}
          className="transition-all duration-300 ease-in-out w-28 lg:w-60 focus:shadow-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      <div className="flex gap-2 md:order-2">
        <Button
          className="lg:w-12 lg:h-10  lg:inline sm:w-10 sm:h-8"
          color="gray"
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === "light" ? <FaSun /> : <FaMoon />}
        </Button>
        {currentUser ? (
          <div className="hidden md:block">
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar alt="user" img={currentUser.profilePicture} rounded />
              }
            >
              <Dropdown.Header>
                <span className="block text-sm">@{currentUser.username}</span>
                <span className="block text-sm font-medium truncate">
                  {currentUser.email}
                </span>
              </Dropdown.Header>
              <Link to={"/dashboard?tab=profile"}>
                <Dropdown.Item>Profile</Dropdown.Item>
              </Link>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleSignout}>Sign out</Dropdown.Item>
            </Dropdown>
          </div>
        ) : (
          <Link to="/sign-in" className=" hidden lg:inline">
            <Button gradientDuoTone="purpleToBlue" outline>
              Sign In
            </Button>
          </Link>
        )}
        <Navbar.Toggle />
      </div>


     <Navbar.Collapse>
  {[
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/projects", label: "Projects" },
  ].map((link) => {
    const isActive = path === link.path;

    return (
      <Navbar.Link
        key={link.path}
        as="div"
         
        className={`mt-2 px-3 py-1 rounded ${
          theme === "light"
            ? isActive
              ? "text-purple-700  font-semibold"
              : "text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            : isActive
            ? "text-purple-100 font-semibold"
            : "text-gray-300 hover:text-purple-300 hover:bg-gray-700 transition-colors"
        }`}
       
      >
        <Link to={link.path}>{link.label}</Link>
      </Navbar.Link>
    );
  })}



        {currentUser ? (
          <div className="lg:hidden mt-2 flex items-center justify-between w-full px-2">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleProfileRedirect}
            >
              <Avatar
                alt={currentUser.username}
                img={currentUser.profilePicture || "/default-avatar.png"}
                rounded
                size="sm"
              />
              <span>{currentUser.username}</span>
            </div>

            <Button
              gradientDuoTone="purpleToBlue"
              outline
              onClick={handleSignout}
              size="sm"
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <Navbar.Link className="lg:hidden mt-2">
            <Link to="/sign-in">
              <Button gradientDuoTone="purpleToBlue" outline>
                Sign In
              </Button>
            </Link>
          </Navbar.Link>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}
