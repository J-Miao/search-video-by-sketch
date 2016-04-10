/****************************************************************************
** Meta object code from reading C++ file 'sketcharea.h'
**
** Created by: The Qt Meta Object Compiler version 67 (Qt 5.2.1)
**
** WARNING! All changes made in this file will be lost!
*****************************************************************************/

#include "../../../gui/SketchSearchDemo/sketcharea.h"
#include <QtCore/qbytearray.h>
#include <QtCore/qmetatype.h>
#if !defined(Q_MOC_OUTPUT_REVISION)
#error "The header file 'sketcharea.h' doesn't include <QObject>."
#elif Q_MOC_OUTPUT_REVISION != 67
#error "This file was generated using the moc from 5.2.1. It"
#error "cannot be used with the include files from this version of Qt."
#error "(The moc has changed too much.)"
#endif

QT_BEGIN_MOC_NAMESPACE
struct qt_meta_stringdata_SketchArea_t {
    QByteArrayData data[7];
    char stringdata[69];
};
#define QT_MOC_LITERAL(idx, ofs, len) \
    Q_STATIC_BYTE_ARRAY_DATA_HEADER_INITIALIZER_WITH_OFFSET(len, \
    offsetof(qt_meta_stringdata_SketchArea_t, stringdata) + ofs \
        - idx * sizeof(QByteArrayData) \
    )
static const qt_meta_stringdata_SketchArea_t qt_meta_stringdata_SketchArea = {
    {
QT_MOC_LITERAL(0, 0, 10),
QT_MOC_LITERAL(1, 11, 13),
QT_MOC_LITERAL(2, 25, 0),
QT_MOC_LITERAL(3, 26, 8),
QT_MOC_LITERAL(4, 35, 15),
QT_MOC_LITERAL(5, 51, 10),
QT_MOC_LITERAL(6, 62, 5)
    },
    "SketchArea\0newSketchDone\0\0fileName\0"
    "clearSketchDone\0clearImage\0print\0"
};
#undef QT_MOC_LITERAL

static const uint qt_meta_data_SketchArea[] = {

 // content:
       7,       // revision
       0,       // classname
       0,    0, // classinfo
       4,   14, // methods
       0,    0, // properties
       0,    0, // enums/sets
       0,    0, // constructors
       0,       // flags
       2,       // signalCount

 // signals: name, argc, parameters, tag, flags
       1,    1,   34,    2, 0x06,
       4,    0,   37,    2, 0x06,

 // slots: name, argc, parameters, tag, flags
       5,    0,   38,    2, 0x0a,
       6,    0,   39,    2, 0x0a,

 // signals: parameters
    QMetaType::Void, QMetaType::QString,    3,
    QMetaType::Void,

 // slots: parameters
    QMetaType::Void,
    QMetaType::Void,

       0        // eod
};

void SketchArea::qt_static_metacall(QObject *_o, QMetaObject::Call _c, int _id, void **_a)
{
    if (_c == QMetaObject::InvokeMetaMethod) {
        SketchArea *_t = static_cast<SketchArea *>(_o);
        switch (_id) {
        case 0: _t->newSketchDone((*reinterpret_cast< const QString(*)>(_a[1]))); break;
        case 1: _t->clearSketchDone(); break;
        case 2: _t->clearImage(); break;
        case 3: _t->print(); break;
        default: ;
        }
    } else if (_c == QMetaObject::IndexOfMethod) {
        int *result = reinterpret_cast<int *>(_a[0]);
        void **func = reinterpret_cast<void **>(_a[1]);
        {
            typedef void (SketchArea::*_t)(const QString & );
            if (*reinterpret_cast<_t *>(func) == static_cast<_t>(&SketchArea::newSketchDone)) {
                *result = 0;
            }
        }
        {
            typedef void (SketchArea::*_t)();
            if (*reinterpret_cast<_t *>(func) == static_cast<_t>(&SketchArea::clearSketchDone)) {
                *result = 1;
            }
        }
    }
}

const QMetaObject SketchArea::staticMetaObject = {
    { &QWidget::staticMetaObject, qt_meta_stringdata_SketchArea.data,
      qt_meta_data_SketchArea,  qt_static_metacall, 0, 0}
};


const QMetaObject *SketchArea::metaObject() const
{
    return QObject::d_ptr->metaObject ? QObject::d_ptr->dynamicMetaObject() : &staticMetaObject;
}

void *SketchArea::qt_metacast(const char *_clname)
{
    if (!_clname) return 0;
    if (!strcmp(_clname, qt_meta_stringdata_SketchArea.stringdata))
        return static_cast<void*>(const_cast< SketchArea*>(this));
    return QWidget::qt_metacast(_clname);
}

int SketchArea::qt_metacall(QMetaObject::Call _c, int _id, void **_a)
{
    _id = QWidget::qt_metacall(_c, _id, _a);
    if (_id < 0)
        return _id;
    if (_c == QMetaObject::InvokeMetaMethod) {
        if (_id < 4)
            qt_static_metacall(this, _c, _id, _a);
        _id -= 4;
    } else if (_c == QMetaObject::RegisterMethodArgumentMetaType) {
        if (_id < 4)
            *reinterpret_cast<int*>(_a[0]) = -1;
        _id -= 4;
    }
    return _id;
}

// SIGNAL 0
void SketchArea::newSketchDone(const QString & _t1)
{
    void *_a[] = { 0, const_cast<void*>(reinterpret_cast<const void*>(&_t1)) };
    QMetaObject::activate(this, &staticMetaObject, 0, _a);
}

// SIGNAL 1
void SketchArea::clearSketchDone()
{
    QMetaObject::activate(this, &staticMetaObject, 1, 0);
}
QT_END_MOC_NAMESPACE
