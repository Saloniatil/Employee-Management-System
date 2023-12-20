import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { resourceLimits } from "worker_threads";

const router = express.Router();

router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * from admin Where email = ? and password = ?";
  con.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      const email = result[0].email;
      const token = jwt.sign(
        { role: "admin", email: email, id: result[0].id },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie("token", token);
      return res.json({ loginStatus: true });
    } else {
      return res.json({ loginStatus: false, Error: "wrong email or password" });
    }
  });
});

router.get("/category", (req, res) => {
  const sql = "SELECT * FROM category";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.post("/add_category", (req, res) => {
  const sql = "INSERT INTO category ( `name`) VALUES (?)";
  con.query(sql, [req.body.category], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true });
  });
});

router.get("/department", (req, res) => {
  const sql = "SELECT * FROM department";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.post("/add_department", (req, res) => {
  const sql = "INSERT INTO department ( `name`) VALUES (?)";
  con.query(sql, [req.body.category], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true });
  });
});
router.post("/assign_department", (req, res) => {
  const data = {
    id: req.body.id,
    department_id: req.body.department_id,
  };
  console.log(req.body);
  const sql = "INSERT INTO assign_department set ?";
  con.query(sql, [data], (err, result) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json({ Status: true });
    }
  });
});

router.get("/view_department/:id", (req, res) => {
  const id = req.params.id
  console.log(req.body)
  const sql = `select name from department where id in (select department_id from assign_department where id =${id})`;
  con.query(sql, (err, result) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(result);
    }
  });
});

router.post('/add_depertment', (req, res) => {
  const sql = "INSERT INTO department (`name`) VALUES (?)"
  con.query(sql, [req.body.department], (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"})
    return res.json({Status: true})
  })
})

//image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
});

//end img upload
router.post("/add_employee", upload.single("image"), (req, res) => {
  const sql = `INSERT INTO  employee 
  (id, name, email,password, address, salary,image, category_name  ) 
  VALUES (?)`;
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    const values = [
      req.body.id,
      req.body.name,
      req.body.email,
      hash,
      req.body.address,
      req.body.salary,
      req.file.filename,
      req.body.category_name
      // req.body.department_id,
    ];
    con.query(sql, [values], (err, result) => {
      if (err) return res.json({ Status: false, Error: err });
      return res.json({ Status: true });
    });
  });
});


router.get("/employee", (req, res) => {
  const sql = "SELECT * FROM  employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.put("/edit_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE employee 
      set name = ?, email = ?,  salary = ?, address = ?
      Where id = ?`;
  const values = [
    req.body.name,
    req.body.email,
    req.body.salary,
    req.body.address,
    req.body.category_id,
    // req.body.department_id,
  ];
  con.query(sql, [...values, id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.delete("/delete_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "delete from employee where id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

// router.post("/assign_department", (req, res) => {
//   console.log(req.body);
//   const data = {
//     id: req.body.id,
//     department_id: req.body.department_id,
//   };
//   // console.log(data)
//   const sql = "INSERT INTO assign_department set ?";
//   con.query(sql, [req.body], (err, result) => {
//     if (err) {
//       return res.json(err);
//     } else {
//       return res.json({ Status: true });
//     }
//   });
// });

// router.get("/assign_department", (req, res) => {
//   console.log(req.body);
//   const data = {
//     id: req.body.id,
//     department_id: req.body.department_id,
//   };
//   // console.log(data)
//   const sql = "SELECT * FROM assign_department WHERE id = ?";
//   con.query(sql, [req.body], (err, result) => {
//     if (err) {
//       return res.json(err);
//     } else {
//       return res.json({ Status: true });
//     }
//   });
// });
router.get("/admin_count", (req, res) => {
  const sql = "select count(id) as admin from admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/employee_count", (req, res) => {
  const sql = "select count(id) as  employee from  employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/salary_count", (req, res) => {
  const sql = "select sum(salary) as salaryOFEmp  from  employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/admin_records", (req, res) => {
  const sql = "select * from admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});
export { router as adminRouter };
