/*************************************************************************
 * Copyright (c) 2014 Zhang Dongdong
 * All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
**************************************************************************/
/*
#-------------------------------------------------
# @Author: zdd
# @Email: zddhub@gmail.com
#
# rstc.cc in Qt
#
# Thanks:
#    Original by Tilke Judd
#    Tweaks by Szymon Rusinkiewicz
#
#    apparentridge.h
#    Compute apparent ridges.
#
#    Implements method of
#      Judd, T., Durand, F, and Adelson, E.
#      Apparent Ridges for Line Drawing,
#      ACM Trans. Graphics (Proc. SIGGRAPH), vol. 26, no. 3, 2007.
#-------------------------------------------------
*/
#include "trimeshview.h"

#include <QFile>
#include <QTextStream>

//�������_������
static void write_to_file(const vector<float> &v, QString filename)
{
    QFile file(filename);
    file.open(QFile::WriteOnly);

    QTextStream out(&file);

    for(unsigned int i = 0; i < v.size(); i++)
    {
        out << v[i] - 1.0f << " ";
    }
    out <<"\r\n";

    file.close();
}

TriMeshView::TriMeshView(QWidget *parent) :
    QGLWidget(parent)
{
    QSizePolicy sizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
    this->setSizePolicy(sizePolicy);

    this->setFocusPolicy(Qt::StrongFocus);//QWidgetֻ�����ý�����ܽ��а�����Ӧ

    this->timer = new QTimer(this);
    timer->start(1);
    connect(this->timer, SIGNAL(timeout()), this, SLOT(autospin()));

    resize(840, 720);

    isCtrlPressed = false;
    triMesh = NULL;
    feature_size = 0.0f;

    currcolor = vec(0.0, 0.0, 0.0);

    sug_thresh = 0.1f;
    rv_thresh = 0.1f;
    ar_thresh = 0.1f;

    closeAllDrawings();
}

TriMeshView::~TriMeshView()
{
    if(triMesh)
    {
        delete triMesh;
        triMesh = NULL;
    }
}

void TriMeshView::autospin()
{
    if(camera.autospin(xf))
    {
        updateGL();
    }
}

void TriMeshView::closeAllDrawings()
{
    //draw_base
    isDrawEdges = false;

    isDrawNormals = false;
    isDrawPreview = false;
    isDrawCurv1 = false;
    isDrawCurv2 = false;

    isDrawCurvColors = false;
    isDrawNormalColors = false;

    //draw_lines

    isDrawBoundaries = false;

    isDrawSilhouette = false;
    isDrawOccludingContours = true;
    isDrawSuggestiveContours = true;

    isDrawIsophotes = false;
    isDrawTopolines = false;

    isDrawRidges = false;
    isDrawValleys = false;

    isDrawApparentRidges = false;
}

bool TriMeshView::readMesh(const char *filename, const char *xffilename)
{
    if(triMesh)
    {
        delete triMesh;
        triMesh = NULL;

        curv_colors.clear();
        normal_colors.clear();
    }

    triMesh = TriangleMesh::read(filename);
    if(!triMesh)
    {
        cout<<"read file "<<filename<<" error."<<endl;
        exit(-1);
    }

    triMesh->need_tstrips();
    triMesh->need_bsphere();
    triMesh->need_normals();
    triMesh->need_curvatures();
    triMesh->need_dcurv();

//    write_to_file(triMesh->curv1, "normal_curv1.txt");
//    write_to_file(triMesh->curv2, "normal_curv2.txt");

    feature_size = triMesh->feature_size();

    if(!xf.read(xffilename))
        xf = xform::trans(0, 0, -3.5f / 0.7 * triMesh->bsphere.r) *
                             xform::trans(-triMesh->bsphere.center);
    else {
        xf = xform::trans(0, 0, -3.5f / 0.7 * triMesh->bsphere.r) *
                xform::trans(-triMesh->bsphere.center) *xf;
    }

    camera.stopspin();

    updateGL();
    return true;
}

void TriMeshView::clearMesh()
{
    if(triMesh) {
        delete triMesh;
        triMesh = NULL;
    }
    updateGL();
}

//------------------------protected function------------------------

void TriMeshView::resizeGL(int width, int height)
{
    //����opengl�ӿ���QWidget���ڴ�С��ͬ
    glViewport( 0, 0, (GLint)width, (GLint)height );
}

// Clear the screen and reset OpenGL modes to something sane
void TriMeshView::cls()
{
    glDisable(GL_DITHER);
    glDisable(GL_BLEND);
    glDisable(GL_DEPTH_TEST);
    glDisable(GL_NORMALIZE);
    glDisable(GL_LIGHTING);
    glDisable(GL_COLOR_MATERIAL);
    glClearColor(1,1,1,0);
//        if (color_style == COLOR_GRAY)
//                glClearColor(0.8, 0.8, 0.8, 0);
    glClearDepth(1);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}

void TriMeshView::paintGL()
{
    if(!triMesh)
    {
        cls();
        return;
    }

    viewpos = inv(xf) * point(0,0,0);

    camera.setupGL(xf * triMesh->bsphere.center, triMesh->bsphere.r);

    cls();

    // Transform and draw
    glPushMatrix();

    glMultMatrixd((double *)xf);
    draw_mesh();
    glPopMatrix();
}

//��꽻������
Mouse::button btn = Mouse::NONE;
void TriMeshView::mousePressEvent(QMouseEvent *e)
{
    if(!triMesh)
        return;

    int x = e->pos().x();
    int y = e->pos().y();

    if(e->button() ==  Qt::LeftButton)
    {
        if(isCtrlPressed)
            btn = Mouse::LIGHT;
        else
            btn = Mouse::ROTATE;
    }
    else if(e->button() == Qt::RightButton)
    {
        if(isCtrlPressed)
            btn = Mouse::LIGHT;
        else
            btn = Mouse::MOVEZ;
    }
    else if(e->button() == Qt::MidButton)
    {
        btn = Mouse::MOVEXY;
    }
    else
        btn = Mouse::NONE;

    //������꽻��λ��(x,y)���·��������
 //   camera.setupGL(xf*triMesh->bsphere.center, triMesh->bsphere.r);
    camera.mouse(x, y, btn, xf*triMesh->bsphere.center, triMesh->bsphere.r, xf);

    mouseMoveEvent(e);
}

void TriMeshView::mouseReleaseEvent(QMouseEvent * e)
{
    if(!triMesh)
        return;

    int x = e->pos().x();
    int y = e->pos().y();

    btn = Mouse::NONE;

    camera.mouse(x, y, btn, xf*triMesh->bsphere.center, triMesh->bsphere.r, xf);
}

void TriMeshView::mouseMoveEvent(QMouseEvent *e)
{
    if(!triMesh)
        return;

    int x = e->pos().x();
    int y = e->pos().y();

    if(e->buttons() &  Qt::LeftButton) //�ú����У�e->button()���Ƿ���Qt::NoButton.
    {
        btn = Mouse::ROTATE;
    }
    else if(e->buttons() &  Qt::RightButton)
    {
        btn = Mouse::MOVEZ;
    }
    else if(e->buttons() &  Qt::MidButton)
    {
        btn = Mouse::MOVEXY;
    }
    else
    {
        btn = Mouse::NONE;
    }

    camera.mouse(x, y, btn, xf*triMesh->bsphere.center, triMesh->bsphere.r, xf);

    if(btn != Mouse::NONE)
        updateGL();
}

void TriMeshView::wheelEvent(QWheelEvent *e)
{
    if(!triMesh)
        return;

    int x = e->pos().x();
    int y = e->pos().y();

    if(e->orientation() == Qt::Vertical)
    {
        if (e->delta() > 0)
        {
            btn = Mouse::WHEELUP;
        }
        else
        {
            btn = Mouse::WHEELDOWN;
        }
    }

    e->accept();
    camera.mouse(x, y, btn, xf*triMesh->bsphere.center, triMesh->bsphere.r, xf);
    //btn = Mouse::NONE;
    updateGL();
}

void TriMeshView::keyPressEvent(QKeyEvent *e)
{
    if(!triMesh)
        return;

    switch(e->key())
    {
    case Qt::Key_Control:
        isCtrlPressed = true;
        break;
    case Qt::Key_N:
        isDrawNormalColors = !isDrawNormalColors;
        break;
    case Qt::Key_E:
        isDrawEdges = !isDrawEdges;
        break;
    case Qt::Key_L:
        isDrawOccludingContours = !isDrawOccludingContours;
        isDrawSuggestiveContours = !isDrawSuggestiveContours;
        break;
    default:
        QGLWidget::keyPressEvent(e);
    }
    updateGL();
}

void TriMeshView::keyReleaseEvent(QKeyEvent * /*e*/)
{
    isCtrlPressed = false;
}
